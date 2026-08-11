import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BodyText, Button, Card, Message, Page, PageTitle } from '../../src/components/ui';
import { useAuth } from '../../src/features/auth/auth-context';
import {
  type PropertyCreate,
  useCreateProperty,
  useProperties,
} from '../../src/features/properties/property-api';
import { PropertyForm } from '../../src/features/properties/property-form';
import { colours } from '../../src/theme';

export default function PropertiesScreen() {
  const { session } = useAuth();
  const properties = useProperties(session);
  const createProperty = useCreateProperty(session);
  const [isAdding, setIsAdding] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function submitProperty(propertyInput: PropertyCreate): Promise<string | null> {
    try {
      const created = await createProperty.mutateAsync(propertyInput);
      setSuccessMessage(`${created.display_name} was added successfully.`);
      setIsAdding(false);
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'The property could not be saved.';
    }
  }

  return (
    <Page>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <PageTitle>Properties</PageTitle>
          <BodyText>
            Active properties appear here. Sold and archived property workflows follow in a later
            slice.
          </BodyText>
        </View>
        {!isAdding ? (
          <View style={styles.addButton}>
            <Button
              onPress={() => {
                setSuccessMessage(null);
                setIsAdding(true);
              }}
            >
              Add property
            </Button>
          </View>
        ) : null}
      </View>

      {successMessage ? <Message>{successMessage}</Message> : null}
      {properties.isError ? <Message kind="error">{properties.error.message}</Message> : null}

      {isAdding ? (
        <Card>
          <PropertyForm onCancel={() => setIsAdding(false)} onSubmit={submitProperty} />
        </Card>
      ) : null}

      {!isAdding && properties.isPending ? <Message>Loading properties…</Message> : null}

      {!isAdding && properties.data?.length === 0 ? (
        <Card>
          <Text style={styles.heading}>No properties yet</Text>
          <BodyText>
            Add your first currently owned property using the secure two-step form.
          </BodyText>
        </Card>
      ) : null}

      {!isAdding && properties.data?.length ? (
        <View style={styles.list}>
          {properties.data.map((property) => (
            <Card key={property.property_id}>
              <View style={styles.propertyHeader}>
                <View style={styles.headerText}>
                  <Text style={styles.heading}>{property.display_name}</Text>
                  <BodyText>
                    {property.address_line_1}, {property.suburb} {property.state}{' '}
                    {property.postcode}
                  </BodyText>
                </View>
                <Text style={styles.status}>Active</Text>
              </View>
              <View style={styles.details}>
                <Text style={styles.detail}>
                  Purchase price: AUD {property.purchase_price.amount}
                </Text>
                <Text style={styles.detail}>
                  Current value:{' '}
                  {property.current_value ? `AUD ${property.current_value.amount}` : 'Not supplied'}
                </Text>
                <Text style={styles.detail}>
                  Remaining loan:{' '}
                  {property.remaining_loan_balance
                    ? `AUD ${property.remaining_loan_balance.amount}`
                    : 'Not supplied'}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      ) : null}

      {!isAdding && properties.isError ? (
        <Button onPress={() => void properties.refetch()} variant="secondary">
          Try again
        </Button>
      ) : null}
    </Page>
  );
}

const styles = StyleSheet.create({
  addButton: {
    minWidth: 150,
  },
  detail: {
    color: colours.text,
    fontSize: 15,
  },
  details: {
    gap: 8,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    gap: 8,
    minWidth: 240,
  },
  heading: {
    color: colours.text,
    fontSize: 22,
    fontWeight: '700',
  },
  list: {
    gap: 14,
  },
  propertyHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  status: {
    backgroundColor: '#E5F2EE',
    borderRadius: 999,
    color: colours.accent,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 6,
    textTransform: 'uppercase',
  },
});
