import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BodyText, Button, Card, Message, Page, PageTitle } from '../../src/components/ui';
import { appSettings } from '../../src/config/app-settings';
import { useAuth } from '../../src/features/auth/auth-context';
import { lookupAddressesWithSupabase } from '../../src/features/properties/address-lookup-api';
import {
  type Property,
  type PropertyCreate,
  type PropertyListStatus,
  useCreateProperty,
  useProperties,
  useUpdateProperty,
  useUpdatePropertyStatus,
} from '../../src/features/properties/property-api';
import { PropertyForm, propertyFormValues } from '../../src/features/properties/property-form';
import { colours } from '../../src/theme';

export default function PropertiesScreen() {
  const { session } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<PropertyListStatus>('active');
  const properties = useProperties(session, selectedStatus);
  const createProperty = useCreateProperty(session);
  const updateProperty = useUpdateProperty(session);
  const updateStatus = useUpdatePropertyStatus(session);
  const [isAdding, setIsAdding] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const isFormOpen = isAdding || editingProperty !== null;

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

  function closeForm() {
    setIsAdding(false);
    setEditingProperty(null);
  }

  function selectList(status: PropertyListStatus) {
    closeForm();
    setActionError(null);
    setSelectedStatus(status);
  }

  async function submitProperty(propertyInput: PropertyCreate): Promise<string | null> {
    try {
      if (editingProperty) {
        const updated = await updateProperty.mutateAsync({
          propertyId: editingProperty.property_id,
          propertyInput,
        });
        setSuccessMessage(`${updated.display_name} was updated successfully.`);
      } else {
        const created = await createProperty.mutateAsync(propertyInput);
        setSuccessMessage(`${created.display_name} was added successfully.`);
      }
      closeForm();
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'The property could not be saved.';
    }
  }

  async function changePropertyStatus(property: Property) {
    const nextStatus: PropertyListStatus = property.status === 'active' ? 'archived' : 'active';
    setActionError(null);
    try {
      const updated = await updateStatus.mutateAsync({
        propertyId: property.property_id,
        status: nextStatus,
      });
      setSuccessMessage(
        nextStatus === 'archived'
          ? `${updated.display_name} was archived.`
          : `${updated.display_name} was restored to Active.`,
      );
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'The property status could not be updated.',
      );
    }
  }

  return (
    <Page>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <PageTitle>Properties</PageTitle>
          <BodyText>Manage currently owned and archived properties.</BodyText>
        </View>
        {!isFormOpen && selectedStatus === 'active' ? (
          <View style={styles.addButton}>
            <Button
              onPress={() => {
                setActionError(null);
                setIsAdding(true);
              }}
            >
              Add property
            </Button>
          </View>
        ) : null}
      </View>

      <View accessibilityRole="tablist" style={styles.tabs}>
        {(['active', 'archived'] as const).map((status) => {
          const selected = selectedStatus === status;
          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              key={status}
              onPress={() => selectList(status)}
              style={[styles.tab, selected ? styles.tabSelected : null]}
            >
              <Text style={[styles.tabText, selected ? styles.tabTextSelected : null]}>
                {status === 'active' ? 'Active' : 'Archived'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {successMessage ? <Message>{successMessage}</Message> : null}
      {actionError ? <Message kind="error">{actionError}</Message> : null}
      {properties.isError ? <Message kind="error">{properties.error.message}</Message> : null}

      {isFormOpen ? (
        <Card>
          <PropertyForm
            accessToken={session?.access_token}
            initialValues={editingProperty ? propertyFormValues(editingProperty) : undefined}
            key={editingProperty?.property_id ?? 'new-property'}
            onAddressLookup={lookupAddressesWithSupabase}
            onCancel={closeForm}
            onSubmit={submitProperty}
          />
        </Card>
      ) : null}

      {!isFormOpen && properties.isPending ? <Message>Loading properties…</Message> : null}

      {!isFormOpen && properties.data?.length === 0 ? (
        <Card>
          <Text style={styles.heading}>
            {selectedStatus === 'active' ? 'No active properties' : 'No archived properties'}
          </Text>
          <BodyText>
            {selectedStatus === 'active'
              ? 'Add your first currently owned property using the secure two-step form.'
              : 'Properties you archive will remain available here.'}
          </BodyText>
        </Card>
      ) : null}

      {!isFormOpen && properties.data?.length ? (
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
                <Text style={styles.status}>{property.status}</Text>
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
              <View style={styles.actions}>
                <View style={styles.actionButton}>
                  <Button
                    onPress={() => {
                      setActionError(null);
                      setEditingProperty(property);
                    }}
                    variant="secondary"
                  >
                    Edit
                  </Button>
                </View>
                <View style={styles.actionButton}>
                  <Button
                    disabled={updateStatus.isPending}
                    onPress={() => void changePropertyStatus(property)}
                    variant="secondary"
                  >
                    {property.status === 'active' ? 'Archive' : 'Mark as active'}
                  </Button>
                </View>
              </View>
            </Card>
          ))}
        </View>
      ) : null}

      {!isFormOpen && properties.isError ? (
        <Button onPress={() => void properties.refetch()} variant="secondary">
          Try again
        </Button>
      ) : null}
    </Page>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    minWidth: 140,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
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
  tab: {
    alignItems: 'center',
    borderBottomColor: 'transparent',
    borderBottomWidth: 3,
    minWidth: 120,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  tabSelected: {
    borderBottomColor: colours.accent,
  },
  tabs: {
    borderBottomColor: colours.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  tabText: {
    color: colours.muted,
    fontSize: 16,
    fontWeight: '600',
  },
  tabTextSelected: {
    color: colours.accent,
  },
});
