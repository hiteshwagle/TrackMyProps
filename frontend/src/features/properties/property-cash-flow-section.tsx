import { zodResolver } from '@hookform/resolvers/zod';
import type { Session } from '@supabase/supabase-js';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

import { Button, Field, Message } from '../../components/ui';
import { appSettings } from '../../config/app-settings';
import { colours } from '../../theme';
import {
  type CashFlowFrequency,
  type CashFlowItemType,
  type PropertyCashFlowItem,
  type PropertyCashFlowItemCreate,
  useCreatePropertyCashFlowItem,
  useDeletePropertyCashFlowItem,
  usePropertyCashFlowItems,
} from './property-cash-flow-api';

const moneyValue = z
  .string()
  .trim()
  .regex(/^(?=.*[1-9])\d+(?:\.\d{1,2})?$/, 'Enter a positive AUD amount with up to two decimals.');
const optionalIsoDate = z
  .string()
  .refine((value) => value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value), 'Select a date.');
const cashFlowFormSchema = z
  .object({
    amount: moneyValue,
    endDate: optionalIsoDate,
    frequency: z.enum(['weekly', 'fortnightly', 'monthly', 'quarterly', 'annually', 'one_off']),
    name: z.string().trim().min(1, 'Enter a name.').max(100, 'Use 100 characters or fewer.'),
    occurrenceDate: optionalIsoDate,
    startDate: optionalIsoDate,
  })
  .superRefine((values, context) => {
    if (values.frequency === 'one_off') {
      if (!values.occurrenceDate) {
        context.addIssue({
          code: 'custom',
          message: 'Select the date this item occurred.',
          path: ['occurrenceDate'],
        });
      }
      return;
    }
    if (!values.startDate) {
      context.addIssue({
        code: 'custom',
        message: 'Select the recurring start date.',
        path: ['startDate'],
      });
    }
    if (values.startDate && values.endDate && values.endDate < values.startDate) {
      context.addIssue({
        code: 'custom',
        message: 'End date cannot be before start date.',
        path: ['endDate'],
      });
    }
  });

type CashFlowFormValues = z.infer<typeof cashFlowFormSchema>;

const frequencyOptions: readonly { label: string; value: CashFlowFrequency }[] = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Fortnightly', value: 'fortnightly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Annually', value: 'annually' },
  { label: 'One-off', value: 'one_off' },
];

function buildItemInput(values: CashFlowFormValues): PropertyCashFlowItemCreate {
  const oneOff = values.frequency === 'one_off';
  return {
    amount: { amount: values.amount, currency: 'AUD' },
    end_date: oneOff ? null : values.endDate || null,
    frequency: values.frequency,
    name: values.name.trim(),
    occurrence_date: oneOff ? values.occurrenceDate : null,
    start_date: oneOff ? null : values.startDate,
  };
}

function suggestedNames(itemType: CashFlowItemType): readonly string[] {
  return itemType === 'income'
    ? appSettings.propertyCashFlow.incomeSuggestedNames
    : appSettings.propertyCashFlow.expenseSuggestedNames;
}

function CashFlowItemForm({
  itemType,
  onCancel,
  onSave,
}: {
  itemType: CashFlowItemType;
  onCancel: () => void;
  onSave: (itemInput: PropertyCashFlowItemCreate) => Promise<string | null>;
}) {
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    setError,
    setValue,
  } = useForm<CashFlowFormValues>({
    defaultValues: {
      amount: '',
      endDate: '',
      frequency: itemType === 'income' ? 'weekly' : 'annually',
      name: '',
      occurrenceDate: '',
      startDate: '',
    },
    resolver: zodResolver(cashFlowFormSchema),
  });
  const frequency = useWatch({ control, name: 'frequency' });
  const typeLabel = itemType === 'income' ? 'income' : 'expense';

  async function submit(values: CashFlowFormValues) {
    const error = await onSave(buildItemInput(values));
    if (error) {
      setError('root', { message: error });
    }
  }

  return (
    <View style={styles.form}>
      <Text style={styles.formTitle}>Add {typeLabel}</Text>
      {errors.root?.message ? <Message kind="error">{errors.root.message}</Message> : null}
      <View style={styles.suggestions}>
        <Text style={styles.label}>Suggested names</Text>
        <View style={styles.choiceRow}>
          {suggestedNames(itemType).map((name) => (
            <Pressable
              accessibilityRole="button"
              key={name}
              onPress={() => setValue('name', name, { shouldValidate: true })}
              style={styles.suggestion}
            >
              <Text style={styles.suggestionText}>{name}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <Controller
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <Field
            error={fieldState.error?.message}
            label={`${itemType === 'income' ? 'Income' : 'Expense'} name`}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            placeholder={itemType === 'income' ? 'Rent or another source' : 'Expense name'}
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name="amount"
        render={({ field, fieldState }) => (
          <Field
            error={fieldState.error?.message}
            inputMode="decimal"
            label="Amount (AUD)"
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name="frequency"
        render={({ field, fieldState }) => (
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Frequency</Text>
            <View accessibilityRole="radiogroup" style={styles.choiceRow}>
              {frequencyOptions.map((option) => {
                const selected = field.value === option.value;
                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    key={option.value}
                    onPress={() => field.onChange(option.value)}
                    style={[styles.choice, selected ? styles.choiceSelected : null]}
                  >
                    <Text style={[styles.choiceText, selected ? styles.choiceTextSelected : null]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {fieldState.error?.message ? (
              <Text style={styles.errorText}>{fieldState.error.message}</Text>
            ) : null}
          </View>
        )}
      />
      {frequency === 'one_off' ? (
        <Controller
          control={control}
          name="occurrenceDate"
          render={({ field, fieldState }) => (
            <Field
              error={fieldState.error?.message}
              label="Occurrence date"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              value={field.value}
              webInputType="date"
            />
          )}
        />
      ) : (
        <View style={styles.dateFields}>
          <View style={styles.dateField}>
            <Controller
              control={control}
              name="startDate"
              render={({ field, fieldState }) => (
                <Field
                  error={fieldState.error?.message}
                  label="Start date"
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                  value={field.value}
                  webInputType="date"
                />
              )}
            />
          </View>
          <View style={styles.dateField}>
            <Controller
              control={control}
              name="endDate"
              render={({ field, fieldState }) => (
                <Field
                  error={fieldState.error?.message}
                  label="End date (optional)"
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                  value={field.value}
                  webInputType="date"
                />
              )}
            />
          </View>
        </View>
      )}
      <View style={styles.actions}>
        <View style={styles.actionButton}>
          <Button onPress={onCancel} variant="secondary">
            Cancel
          </Button>
        </View>
        <View style={styles.actionButton}>
          <Button disabled={isSubmitting} onPress={() => void handleSubmit(submit)()}>
            {isSubmitting ? 'Saving…' : `Save ${typeLabel}`}
          </Button>
        </View>
      </View>
    </View>
  );
}

function formatAudAmount(amount: string): string {
  const [whole, fraction = ''] = amount.split('.');
  const groupedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `AUD ${groupedWhole}.${fraction.padEnd(2, '0').slice(0, 2)}`;
}

function itemSchedule(item: PropertyCashFlowItem): string {
  if (item.frequency === 'one_off') {
    return `One-off on ${item.occurrence_date}`;
  }
  const label = frequencyOptions.find((option) => option.value === item.frequency)?.label;
  return `${label} from ${item.start_date}${item.end_date ? ` to ${item.end_date}` : ''}`;
}

function CashFlowList({
  isDeleting,
  itemType,
  items,
  onCancelRemove,
  onConfirmRemove,
  onRequestRemove,
  pendingRemovalId,
}: {
  isDeleting: boolean;
  itemType: CashFlowItemType;
  items: PropertyCashFlowItem[];
  onCancelRemove: () => void;
  onConfirmRemove: (item: PropertyCashFlowItem) => void;
  onRequestRemove: (item: PropertyCashFlowItem) => void;
  pendingRemovalId: string | null;
}) {
  if (items.length === 0) {
    return (
      <Text style={styles.emptyText}>
        {itemType === 'income' ? 'No income sources added.' : 'No expenses added.'}
      </Text>
    );
  }

  return (
    <View style={styles.items}>
      {items.map((item) => {
        const confirming = pendingRemovalId === item.item_id;
        return (
          <View key={item.item_id} style={styles.item}>
            <View style={styles.itemText}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemAmount}>{formatAudAmount(item.amount.amount)}</Text>
              <Text style={styles.itemSchedule}>{itemSchedule(item)}</Text>
            </View>
            {confirming ? (
              <View style={styles.removeConfirmation}>
                <Text style={styles.removePrompt}>Remove {item.name}?</Text>
                <Button disabled={isDeleting} onPress={() => onConfirmRemove(item)}>
                  Confirm remove
                </Button>
                <Button onPress={onCancelRemove} variant="secondary">
                  Cancel
                </Button>
              </View>
            ) : (
              <Button onPress={() => onRequestRemove(item)} variant="secondary">
                Remove
              </Button>
            )}
          </View>
        );
      })}
    </View>
  );
}

export function PropertyCashFlowSection({
  onSuccess,
  propertyId,
  session,
}: {
  onSuccess: (message: string) => void;
  propertyId: string;
  session: Session | null;
}) {
  const income = usePropertyCashFlowItems(session, propertyId, 'income');
  const expenses = usePropertyCashFlowItems(session, propertyId, 'expense');
  const createItem = useCreatePropertyCashFlowItem(session);
  const deleteItem = useDeletePropertyCashFlowItem(session);
  const [addingType, setAddingType] = useState<CashFlowItemType | null>(null);
  const [pendingRemovalId, setPendingRemovalId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function saveItem(itemInput: PropertyCashFlowItemCreate): Promise<string | null> {
    if (!addingType) {
      return 'Select an income or expense type.';
    }
    try {
      const created = await createItem.mutateAsync({ itemInput, itemType: addingType, propertyId });
      setAddingType(null);
      onSuccess(
        addingType === 'income'
          ? `${created.name} income was added.`
          : `${created.name} expense was added.`,
      );
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'The item could not be saved.';
    }
  }

  async function removeItem(item: PropertyCashFlowItem) {
    setActionError(null);
    try {
      await deleteItem.mutateAsync({
        itemId: item.item_id,
        itemType: item.item_type,
        propertyId,
      });
      setPendingRemovalId(null);
      onSuccess(`${item.name} was removed.`);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'The item could not be removed.');
    }
  }

  const queryError = income.isError ? income.error : expenses.isError ? expenses.error : null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Income and expenses</Text>
        <View style={styles.actions}>
          <Button
            onPress={() => {
              setActionError(null);
              setAddingType('income');
            }}
            variant="secondary"
          >
            Add income
          </Button>
          <Button
            onPress={() => {
              setActionError(null);
              setAddingType('expense');
            }}
            variant="secondary"
          >
            Add expense
          </Button>
        </View>
      </View>
      {actionError ? <Message kind="error">{actionError}</Message> : null}
      {queryError ? <Message kind="error">{queryError.message}</Message> : null}
      {addingType ? (
        <CashFlowItemForm
          itemType={addingType}
          key={addingType}
          onCancel={() => setAddingType(null)}
          onSave={saveItem}
        />
      ) : null}
      <View style={styles.columns}>
        <View style={styles.column}>
          <Text style={styles.listTitle}>Income sources</Text>
          {income.isPending ? (
            <Text style={styles.emptyText}>Loading income…</Text>
          ) : (
            <CashFlowList
              isDeleting={deleteItem.isPending}
              itemType="income"
              items={income.data ?? []}
              onCancelRemove={() => setPendingRemovalId(null)}
              onConfirmRemove={(item) => void removeItem(item)}
              onRequestRemove={(item) => setPendingRemovalId(item.item_id)}
              pendingRemovalId={pendingRemovalId}
            />
          )}
        </View>
        <View style={styles.column}>
          <Text style={styles.listTitle}>Expenses</Text>
          {expenses.isPending ? (
            <Text style={styles.emptyText}>Loading expenses…</Text>
          ) : (
            <CashFlowList
              isDeleting={deleteItem.isPending}
              itemType="expense"
              items={expenses.data ?? []}
              onCancelRemove={() => setPendingRemovalId(null)}
              onConfirmRemove={(item) => void removeItem(item)}
              onRequestRemove={(item) => setPendingRemovalId(item.item_id)}
              pendingRemovalId={pendingRemovalId}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    flex: 1,
    minWidth: 150,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  choice: {
    backgroundColor: colours.white,
    borderColor: colours.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choiceSelected: {
    backgroundColor: colours.accent,
    borderColor: colours.accent,
  },
  choiceText: {
    color: colours.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  choiceTextSelected: {
    color: colours.white,
  },
  column: {
    flex: 1,
    gap: 10,
    minWidth: 250,
  },
  columns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
  },
  dateField: {
    flex: 1,
    minWidth: 210,
  },
  dateFields: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  emptyText: {
    color: colours.muted,
    fontSize: 14,
  },
  errorText: {
    color: colours.danger,
    fontSize: 14,
  },
  fieldGroup: {
    gap: 7,
  },
  form: {
    backgroundColor: '#F6FAF8',
    borderColor: colours.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  formTitle: {
    color: colours.text,
    fontSize: 18,
    fontWeight: '700',
  },
  item: {
    alignItems: 'flex-start',
    borderColor: colours.border,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  itemAmount: {
    color: colours.text,
    fontSize: 15,
    fontWeight: '700',
  },
  itemName: {
    color: colours.text,
    fontSize: 16,
    fontWeight: '700',
  },
  itemSchedule: {
    color: colours.muted,
    fontSize: 13,
  },
  itemText: {
    gap: 3,
  },
  items: {
    gap: 10,
  },
  label: {
    color: colours.text,
    fontSize: 14,
    fontWeight: '600',
  },
  listTitle: {
    color: colours.text,
    fontSize: 17,
    fontWeight: '700',
  },
  removeConfirmation: {
    gap: 8,
    width: '100%',
  },
  removePrompt: {
    color: colours.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colours.text,
    fontSize: 20,
    fontWeight: '700',
  },
  suggestion: {
    backgroundColor: '#E5F2EE',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  suggestionText: {
    color: colours.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  suggestions: {
    gap: 7,
  },
});
