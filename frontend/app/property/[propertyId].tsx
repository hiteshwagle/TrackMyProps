import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { BodyText, Button, Card, Message, Page, PageTitle } from '../../src/components/ui';
import { appSettings } from '../../src/config/app-settings';
import { useAuth } from '../../src/features/auth/auth-context';
import { lookupAddressesWithSupabase } from '../../src/features/properties/address-lookup-api';
import { PropertyCashFlowSection } from '../../src/features/properties/property-cash-flow-section';
import {
  type PropertyCreate,
  useProperty,
  useUpdateProperty,
} from '../../src/features/properties/property-api';
import { PropertyForm, propertyFormValues } from '../../src/features/properties/property-form';
import { colours } from '../../src/theme';

export default function PropertyDetailsScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>();
  const { session } = useAuth();
  const property = useProperty(session, propertyId || '');
  const updateProperty = useUpdateProperty(session);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!successMessage) {
      return;
    }
    const timeout = setTimeout(
      () => setSuccessMessage(null),
      appSettings.feedback.successMessageDurationMilliseconds,
    );
    return () => clearTimeout(timeout);
  }, [successMessage]);

  async function submitProperty(propertyInput: PropertyCreate): Promise<string | null> {
    try {
      const updated = await updateProperty.mutateAsync({ propertyId, propertyInput });
      setSuccessMessage(`${updated.display_name} was updated successfully.`);
      setIsEditing(false);
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'The property could not be saved.';
    }
  }

  if (property.isPending) {
    return (
      <Page>
        <Message>Loading property details…</Message>
      </Page>
    );
  }

  if (property.isError || !property.data) {
    return (
      <Page>
        <PageTitle>Property details</PageTitle>
        <Message kind="error">
          {property.error?.message || 'The property details could not be loaded.'}
        </Message>
        <Button onPress={() => void property.refetch()} variant="secondary">
          Try again
        </Button>
      </Page>
    );
  }

  const propertyRecord = property.data;

  return (
    <Page>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <PageTitle>{propertyRecord.display_name}</PageTitle>
          <BodyText>
            {propertyRecord.address_line_1}, {propertyRecord.suburb} {propertyRecord.state}{' '}
            {propertyRecord.postcode}
          </BodyText>
        </View>
        <View style={styles.statusBadge}>
          <Text numberOfLines={1} style={styles.statusText}>
            {propertyRecord.status}
          </Text>
        </View>
      </View>

      {successMessage ? <Message>{successMessage}</Message> : null}

      {isEditing ? (
        <Card>
          <PropertyForm
            accessToken={session?.access_token}
            initialValues={propertyFormValues(propertyRecord)}
            key={propertyRecord.updated_at}
            onAddressLookup={lookupAddressesWithSupabase}
            onCancel={() => setIsEditing(false)}
            onSubmit={submitProperty}
          />
        </Card>
      ) : (
        <Card>
          <View style={styles.detailsHeader}>
            <Text style={styles.sectionTitle}>Property details</Text>
            <View style={styles.editButton}>
              <Button onPress={() => setIsEditing(true)} variant="secondary">
                Edit property
              </Button>
            </View>
          </View>
          <View style={styles.details}>
            <Detail label="Property type" value={propertyRecord.property_type.replace('_', ' ')} />
            <Detail label="Bedrooms" value={propertyRecord.bedrooms} />
            <Detail label="Bathrooms" value={propertyRecord.bathrooms} />
            <Detail label="Car spaces" value={String(propertyRecord.car_spaces)} />
            <Detail label="Land area" value={`${propertyRecord.land_area_sqm} m²`} />
            <Detail label="Building area" value={`${propertyRecord.building_area_sqm} m²`} />
            <Detail label="Purchase date" value={propertyRecord.purchase_date} />
            <Detail label="Purchase price" value={`AUD ${propertyRecord.purchase_price.amount}`} />
            <Detail
              label="Current value"
              value={
                propertyRecord.current_value
                  ? `AUD ${propertyRecord.current_value.amount}`
                  : 'Not supplied'
              }
            />
            <Detail
              label="Remaining loan"
              value={
                propertyRecord.remaining_loan_balance
                  ? `AUD ${propertyRecord.remaining_loan_balance.amount}`
                  : 'Not supplied'
              }
            />
          </View>
        </Card>
      )}

      {!isEditing ? (
        <Card>
          <PropertyCashFlowSection
            onSuccess={setSuccessMessage}
            propertyId={propertyRecord.property_id}
            session={session}
          />
        </Card>
      ) : null}
    </Page>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  detailLabel: {
    color: colours.muted,
    fontSize: 14,
  },
  detailRow: {
    gap: 4,
    minWidth: 190,
  },
  detailValue: {
    color: colours.text,
    fontSize: 16,
    textTransform: 'capitalize',
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
  },
  detailsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  editButton: {
    minWidth: 150,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    gap: 8,
  },
  sectionTitle: {
    color: colours.text,
    fontSize: 22,
    fontWeight: '700',
  },
  statusBadge: {
    backgroundColor: '#E5F2EE',
    borderRadius: 999,
    flexShrink: 0,
    minWidth: 68,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    color: colours.accent,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
