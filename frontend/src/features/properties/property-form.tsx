import { zodResolver } from '@hookform/resolvers/zod';
import {
  Controller,
  type Control,
  type FieldPath,
  useController,
  useForm,
  useWatch,
} from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type TextInputProps } from 'react-native';
import { z } from 'zod';

import { Button, Field, Message } from '../../components/ui';
import { appSettings } from '../../config/app-settings';
import { colours } from '../../theme';
import type { AddressSuggestion } from './address-lookup';
import type { Property, PropertyCreate } from './property-api';

const requiredText = z.string().trim().min(1, 'This field is required.');
const halfValue = z
  .string()
  .trim()
  .regex(/^\d+(?:\.[05])?$/, 'Use a whole or half value.');
const wholeValue = z.string().trim().regex(/^\d+$/, 'Use a whole number.');
const positiveDecimal = z
  .string()
  .trim()
  .regex(/^(?:0\.[0-9]*[1-9][0-9]*|[1-9][0-9]*(?:\.[0-9]+)?)$/, 'Enter a value above zero.');
const moneyValue = z
  .string()
  .trim()
  .regex(/^(?=.*[1-9])\d+(?:\.\d{1,2})?$/, 'Enter a positive AUD amount with up to two decimals.');
const optionalMoney = z
  .string()
  .trim()
  .refine(
    (value) => value === '' || /^(?=.*[1-9])\d+(?:\.\d{1,2})?$/.test(value),
    'Enter a positive AUD amount with up to two decimals.',
  );
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Select a date.');
const optionalIsoDate = z
  .string()
  .refine((value) => value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value), 'Select a date.');

const propertyFormSchema = z
  .object({
    addressId: z.string().trim(),
    addressLine1: requiredText,
    addressLine2: z.string().trim(),
    addressSearch: z.string().trim().max(appSettings.addressLookup.maximumQueryLength),
    annualInterestRatePercent: z.string().trim(),
    bathrooms: halfValue,
    bedrooms: halfValue,
    buildingAreaSqm: positiveDecimal,
    carSpaces: wholeValue,
    country: z.literal('Australia'),
    currentValue: optionalMoney,
    currentValueAsOf: optionalIsoDate,
    displayName: requiredText,
    landAreaSqm: positiveDecimal,
    loanBalanceAsOf: optionalIsoDate,
    loanChoice: z.enum(['unknown', 'no', 'yes']),
    nextRepaymentDate: optionalIsoDate,
    notes: z.string().trim().max(2000, 'Notes must be 2,000 characters or fewer.'),
    originalLoanAmount: optionalMoney,
    postcode: z
      .string()
      .trim()
      .regex(/^\d{4}$/, 'Enter a four-digit Australian postcode.'),
    propertyType: z.enum([
      'house',
      'apartment_unit',
      'townhouse',
      'villa',
      'land',
      'commercial',
      'other',
    ]),
    purchaseDate: isoDate,
    purchasePrice: moneyValue,
    remainingLoanBalance: z.string().trim(),
    repaymentAmount: optionalMoney,
    repaymentFrequency: z.enum(['weekly', 'fortnightly', 'monthly', 'quarterly', 'annually']),
    state: requiredText,
    suburb: requiredText,
  })
  .superRefine((values, context) => {
    if (Boolean(values.currentValue) !== Boolean(values.currentValueAsOf)) {
      context.addIssue({
        code: 'custom',
        message: 'Current value and its as-of date must be entered together.',
        path: [values.currentValue ? 'currentValueAsOf' : 'currentValue'],
      });
    }

    if (values.loanChoice !== 'yes') {
      return;
    }

    const requiredLoanFields = [
      ['originalLoanAmount', values.originalLoanAmount],
      ['remainingLoanBalance', values.remainingLoanBalance],
      ['loanBalanceAsOf', values.loanBalanceAsOf],
      ['annualInterestRatePercent', values.annualInterestRatePercent],
      ['repaymentAmount', values.repaymentAmount],
      ['nextRepaymentDate', values.nextRepaymentDate],
    ] as const;
    for (const [field, value] of requiredLoanFields) {
      if (!value) {
        context.addIssue({
          code: 'custom',
          message: 'This loan field is required.',
          path: [field],
        });
      }
    }
    if (
      values.remainingLoanBalance &&
      !/^(?:0|0\.[0-9]{1,2}|[1-9][0-9]*(?:\.[0-9]{1,2})?)$/.test(values.remainingLoanBalance)
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Enter a non-negative AUD amount with up to two decimals.',
        path: ['remainingLoanBalance'],
      });
    }
    if (
      values.annualInterestRatePercent &&
      !/^(?:100(?:\.0+)?|(?:\d|[1-9]\d)(?:\.\d{1,6})?)$/.test(values.annualInterestRatePercent)
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Enter an annual percentage from 0 to 100.',
        path: ['annualInterestRatePercent'],
      });
    }
  });

export type PropertyFormValues = z.infer<typeof propertyFormSchema>;

const emptyPropertyFormValues: PropertyFormValues = {
  addressId: '',
  addressLine1: '',
  addressLine2: '',
  addressSearch: '',
  annualInterestRatePercent: '',
  bathrooms: '',
  bedrooms: '',
  buildingAreaSqm: '',
  carSpaces: '',
  country: 'Australia',
  currentValue: '',
  currentValueAsOf: '',
  displayName: '',
  landAreaSqm: '',
  loanBalanceAsOf: '',
  loanChoice: 'unknown',
  nextRepaymentDate: '',
  notes: '',
  originalLoanAmount: '',
  postcode: '',
  propertyType: 'house',
  purchaseDate: '',
  purchasePrice: '',
  remainingLoanBalance: '',
  repaymentAmount: '',
  repaymentFrequency: 'monthly',
  state: '',
  suburb: '',
};

export function propertyFormValues(property: Property): PropertyFormValues {
  return {
    addressId: property.address_id ?? '',
    addressLine1: property.address_line_1,
    addressLine2: property.address_line_2 ?? '',
    addressSearch: [property.address_line_1, property.suburb, property.state, property.postcode]
      .filter(Boolean)
      .join(', '),
    annualInterestRatePercent: property.annual_interest_rate?.display_percent ?? '',
    bathrooms: property.bathrooms,
    bedrooms: property.bedrooms,
    buildingAreaSqm: property.building_area_sqm,
    carSpaces: String(property.car_spaces),
    country: 'Australia',
    currentValue: property.current_value?.amount ?? '',
    currentValueAsOf: property.current_value_as_of ?? '',
    displayName: property.display_name,
    landAreaSqm: property.land_area_sqm,
    loanBalanceAsOf: property.loan_balance_as_of ?? '',
    loanChoice: property.has_loan === true ? 'yes' : property.has_loan === false ? 'no' : 'unknown',
    nextRepaymentDate: property.next_repayment_date ?? '',
    notes: property.notes ?? '',
    originalLoanAmount: property.original_loan_amount?.amount ?? '',
    postcode: property.postcode,
    propertyType: property.property_type,
    purchaseDate: property.purchase_date,
    purchasePrice: property.purchase_price.amount,
    remainingLoanBalance: property.has_loan ? (property.remaining_loan_balance?.amount ?? '') : '',
    repaymentAmount: property.repayment_amount?.amount ?? '',
    repaymentFrequency: property.repayment_frequency ?? 'monthly',
    state: property.state,
    suburb: property.suburb,
  };
}

const stepOneFields: FieldPath<PropertyFormValues>[] = [
  'displayName',
  'addressLine1',
  'addressLine2',
  'suburb',
  'state',
  'postcode',
  'country',
  'propertyType',
  'bedrooms',
  'bathrooms',
  'carSpaces',
  'landAreaSqm',
  'buildingAreaSqm',
  'purchaseDate',
  'purchasePrice',
];

const propertyTypeOptions = [
  { label: 'House', value: 'house' },
  { label: 'Apartment / unit', value: 'apartment_unit' },
  { label: 'Townhouse', value: 'townhouse' },
  { label: 'Villa', value: 'villa' },
  { label: 'Land', value: 'land' },
  { label: 'Commercial', value: 'commercial' },
  { label: 'Other', value: 'other' },
] as const;

const repaymentOptions = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Fortnightly', value: 'fortnightly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Annually', value: 'annually' },
] as const;

function dividePercentageByHundred(value: string): string {
  const [whole, fraction = ''] = value.split('.');
  const decimalPlaces = fraction.length + 2;
  const digits = `${whole}${fraction}`.replace(/^0+(?=\d)/, '');
  const padded = digits.padStart(decimalPlaces + 1, '0');
  const decimalIndex = padded.length - decimalPlaces;
  const result = `${padded.slice(0, decimalIndex)}.${padded.slice(decimalIndex)}`;
  return result.replace(/\.?0+$/, '') || '0';
}

function optionalMoneyValue(value: string) {
  return value ? { amount: value, currency: 'AUD' as const } : null;
}

export function buildPropertyCreate(values: PropertyFormValues): PropertyCreate {
  const hasLoan = values.loanChoice === 'yes' ? true : values.loanChoice === 'no' ? false : null;
  const includesLoan = hasLoan === true;

  return {
    address_id: values.addressId || null,
    address_line_1: values.addressLine1,
    address_line_2: values.addressLine2 || null,
    annual_interest_rate: includesLoan
      ? {
          display_percent: values.annualInterestRatePercent,
          value: dividePercentageByHundred(values.annualInterestRatePercent),
        }
      : null,
    bathrooms: values.bathrooms,
    bedrooms: values.bedrooms,
    building_area_sqm: values.buildingAreaSqm,
    car_spaces: Number.parseInt(values.carSpaces, 10),
    country: 'Australia',
    current_value: optionalMoneyValue(values.currentValue),
    current_value_as_of: values.currentValueAsOf || null,
    display_name: values.displayName,
    has_loan: hasLoan,
    land_area_sqm: values.landAreaSqm,
    loan_balance_as_of: includesLoan ? values.loanBalanceAsOf : null,
    next_repayment_date: includesLoan ? values.nextRepaymentDate : null,
    notes: values.notes || null,
    original_loan_amount: includesLoan ? optionalMoneyValue(values.originalLoanAmount) : null,
    postcode: values.postcode,
    property_type: values.propertyType,
    purchase_date: values.purchaseDate,
    purchase_price: { amount: values.purchasePrice, currency: 'AUD' },
    remaining_loan_balance: includesLoan
      ? { amount: values.remainingLoanBalance, currency: 'AUD' }
      : null,
    repayment_amount: includesLoan ? optionalMoneyValue(values.repaymentAmount) : null,
    repayment_frequency: includesLoan ? values.repaymentFrequency : null,
    state: values.state,
    suburb: values.suburb,
  };
}

type FormFieldProps = TextInputProps & {
  control: Control<PropertyFormValues>;
  label: string;
  name: FieldPath<PropertyFormValues>;
  webInputType?: 'date';
};

function FormField({ control, label, name, webInputType, ...inputProps }: FormFieldProps) {
  const { field, fieldState } = useController({ control, name });
  return (
    <Field
      {...inputProps}
      error={fieldState.error?.message}
      label={label}
      onBlur={field.onBlur}
      onChangeText={field.onChange}
      value={field.value}
      webInputType={webInputType}
    />
  );
}

type Choice = { label: string; value: string };

function ChoiceField({
  error,
  label,
  onChange,
  options,
  value,
}: {
  error?: string;
  label: string;
  onChange: (value: string) => void;
  options: readonly Choice[];
  value: string;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View accessibilityRole="radiogroup" style={styles.choiceRow}>
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              key={option.value}
              onPress={() => onChange(option.value)}
              style={[styles.choice, selected ? styles.choiceSelected : null]}
            >
              <Text style={[styles.choiceText, selected ? styles.choiceTextSelected : null]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

type PropertyFormProps = {
  accessToken?: string;
  onAddressLookup?: (query: string, accessToken: string) => Promise<AddressSuggestion[]>;
  onCancel: () => void;
  onSubmit: (propertyInput: PropertyCreate) => Promise<string | null>;
  initialValues?: PropertyFormValues;
};

export function PropertyForm({
  accessToken,
  initialValues,
  onAddressLookup,
  onCancel,
  onSubmit,
}: PropertyFormProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [addressQuery, setAddressQuery] = useState(initialValues?.addressSearch ?? '');
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [addressLookupError, setAddressLookupError] = useState<string | null>(null);
  const [isLookingUpAddress, setIsLookingUpAddress] = useState(false);
  const addressRequestId = useRef(0);
  const skipNextAddressLookup = useRef(Boolean(initialValues?.addressSearch));
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    setError,
    setValue,
    trigger,
  } = useForm<PropertyFormValues>({
    defaultValues: initialValues ?? emptyPropertyFormValues,
    resolver: zodResolver(propertyFormSchema),
  });
  const loanChoice = useWatch({ control, name: 'loanChoice' });

  useEffect(() => {
    if (skipNextAddressLookup.current) {
      skipNextAddressLookup.current = false;
      return;
    }

    const query = addressQuery.trim();
    const requestId = ++addressRequestId.current;
    if (
      !accessToken ||
      !onAddressLookup ||
      query.length < appSettings.addressLookup.minimumQueryLength
    ) {
      return;
    }

    const timeout = setTimeout(() => {
      setIsLookingUpAddress(true);
      setAddressLookupError(null);
      void onAddressLookup(query, accessToken)
        .then((suggestions) => {
          if (addressRequestId.current === requestId) {
            setAddressSuggestions(suggestions);
          }
        })
        .catch((error: unknown) => {
          if (addressRequestId.current === requestId) {
            setAddressSuggestions([]);
            setAddressLookupError(
              error instanceof Error ? error.message : 'Address lookup is unavailable.',
            );
          }
        })
        .finally(() => {
          if (addressRequestId.current === requestId) {
            setIsLookingUpAddress(false);
          }
        });
    }, appSettings.addressLookup.debounceMilliseconds);

    return () => clearTimeout(timeout);
  }, [accessToken, addressQuery, onAddressLookup]);

  function changeAddressQuery(value: string) {
    addressRequestId.current += 1;
    setAddressQuery(value);
    setAddressSuggestions([]);
    setAddressLookupError(null);
    setIsLookingUpAddress(false);
    setValue('addressSearch', value, { shouldDirty: true });
    setValue('addressId', '', { shouldDirty: true });
  }

  function selectAddress(selected: AddressSuggestion) {
    skipNextAddressLookup.current = true;
    addressRequestId.current += 1;
    setAddressQuery(selected.formatted_address);
    setAddressSuggestions([]);
    setAddressLookupError(null);
    setValue('addressSearch', selected.formatted_address, { shouldDirty: true });
    setValue('addressId', selected.address_id, { shouldDirty: true });
    setValue('addressLine1', selected.address_line_1, { shouldDirty: true, shouldValidate: true });
    setValue('suburb', selected.suburb, { shouldDirty: true, shouldValidate: true });
    setValue('state', selected.state, { shouldDirty: true, shouldValidate: true });
    setValue('postcode', selected.postcode, { shouldDirty: true, shouldValidate: true });
    setValue('country', selected.country, { shouldDirty: true, shouldValidate: true });
  }

  async function nextStep() {
    if (await trigger(stepOneFields)) {
      setStep(2);
    }
  }

  async function submit(values: PropertyFormValues) {
    const error = await onSubmit(buildPropertyCreate(values));
    if (error) {
      setError('root', { message: error });
    }
  }

  return (
    <View style={styles.form}>
      <View>
        <Text style={styles.step}>Step {step} of 2</Text>
        <Text style={styles.title}>{step === 1 ? 'Property details' : 'Financial details'}</Text>
      </View>
      {errors.root?.message ? <Message kind="error">{errors.root.message}</Message> : null}

      {step === 1 ? (
        <>
          <FormField control={control} label="Property name" name="displayName" />
          <View style={styles.addressLookup}>
            <Field
              autoComplete="street-address"
              label="Find address"
              onChangeText={changeAddressQuery}
              placeholder="Start typing an Australian address"
              value={addressQuery}
            />
            {isLookingUpAddress ? (
              <Text style={styles.lookupStatus}>Looking up addresses…</Text>
            ) : null}
            {addressLookupError ? <Text style={styles.errorText}>{addressLookupError}</Text> : null}
            {addressSuggestions.length > 0 ? (
              <View accessibilityLabel="Address suggestions" style={styles.addressSuggestions}>
                {addressSuggestions.map((suggestion) => (
                  <Pressable
                    accessibilityRole="button"
                    key={suggestion.address_id}
                    onPress={() => selectAddress(suggestion)}
                    style={({ pressed }) => [
                      styles.addressSuggestion,
                      pressed ? styles.addressSuggestionPressed : null,
                    ]}
                  >
                    <Text style={styles.addressSuggestionText}>{suggestion.formatted_address}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
          <FormField control={control} label="Address line 1" name="addressLine1" />
          <FormField control={control} label="Address line 2 (optional)" name="addressLine2" />
          <FormField control={control} label="Suburb" name="suburb" />
          <View style={styles.twoColumns}>
            <View style={styles.column}>
              <FormField autoCapitalize="characters" control={control} label="State" name="state" />
            </View>
            <View style={styles.column}>
              <FormField
                control={control}
                inputMode="numeric"
                keyboardType="number-pad"
                label="Postcode"
                maxLength={4}
                name="postcode"
              />
            </View>
          </View>
          <FormField control={control} editable={false} label="Country" name="country" />
          <Controller
            control={control}
            name="propertyType"
            render={({ field, fieldState }) => (
              <ChoiceField
                error={fieldState.error?.message}
                label="Property type"
                onChange={field.onChange}
                options={propertyTypeOptions}
                value={field.value}
              />
            )}
          />
          <View style={styles.twoColumns}>
            <View style={styles.column}>
              <FormField control={control} inputMode="decimal" label="Bedrooms" name="bedrooms" />
            </View>
            <View style={styles.column}>
              <FormField control={control} inputMode="decimal" label="Bathrooms" name="bathrooms" />
            </View>
          </View>
          <FormField
            control={control}
            inputMode="numeric"
            keyboardType="number-pad"
            label="Car spaces"
            name="carSpaces"
          />
          <View style={styles.twoColumns}>
            <View style={styles.column}>
              <FormField
                control={control}
                inputMode="decimal"
                label="Land area (m²)"
                name="landAreaSqm"
              />
            </View>
            <View style={styles.column}>
              <FormField
                control={control}
                inputMode="decimal"
                label="Building area (m²)"
                name="buildingAreaSqm"
              />
            </View>
          </View>
          <FormField
            control={control}
            label="Purchase date"
            name="purchaseDate"
            webInputType="date"
          />
          <FormField
            control={control}
            inputMode="decimal"
            label="Purchase price (AUD)"
            name="purchasePrice"
          />
          <View style={styles.actions}>
            <View style={styles.actionButton}>
              <Button onPress={onCancel} variant="secondary">
                Cancel
              </Button>
            </View>
            <View style={styles.actionButton}>
              <Button onPress={() => void nextStep()}>Continue</Button>
            </View>
          </View>
        </>
      ) : (
        <>
          <Message>
            Financial details are optional. Values are user-provided and are not verified
            valuations.
          </Message>
          <FormField
            control={control}
            inputMode="decimal"
            label="Current value (AUD, optional)"
            name="currentValue"
          />
          <FormField
            control={control}
            label="Current value as of"
            name="currentValueAsOf"
            webInputType="date"
          />
          <Controller
            control={control}
            name="loanChoice"
            render={({ field, fieldState }) => (
              <ChoiceField
                error={fieldState.error?.message}
                label="Does this property have a loan?"
                onChange={field.onChange}
                options={[
                  { label: 'Not supplied', value: 'unknown' },
                  { label: 'No loan', value: 'no' },
                  { label: 'Has a loan', value: 'yes' },
                ]}
                value={field.value}
              />
            )}
          />
          {loanChoice === 'yes' ? (
            <>
              <FormField
                control={control}
                inputMode="decimal"
                label="Total original loan (AUD)"
                name="originalLoanAmount"
              />
              <FormField
                control={control}
                inputMode="decimal"
                label="Remaining loan balance (AUD)"
                name="remainingLoanBalance"
              />
              <FormField
                control={control}
                label="Loan balance as of"
                name="loanBalanceAsOf"
                webInputType="date"
              />
              <FormField
                control={control}
                inputMode="decimal"
                label="Annual interest rate (%)"
                name="annualInterestRatePercent"
              />
              <FormField
                control={control}
                inputMode="decimal"
                label="Repayment amount (AUD)"
                name="repaymentAmount"
              />
              <Controller
                control={control}
                name="repaymentFrequency"
                render={({ field, fieldState }) => (
                  <ChoiceField
                    error={fieldState.error?.message}
                    label="Repayment frequency"
                    onChange={field.onChange}
                    options={repaymentOptions}
                    value={field.value}
                  />
                )}
              />
              <FormField
                control={control}
                label="Next repayment date"
                name="nextRepaymentDate"
                webInputType="date"
              />
            </>
          ) : null}
          <FormField
            control={control}
            label="Notes (optional)"
            multiline
            name="notes"
            numberOfLines={4}
          />
          <View style={styles.actions}>
            <View style={styles.actionButton}>
              <Button onPress={() => setStep(1)} variant="secondary">
                Back
              </Button>
            </View>
            <View style={styles.actionButton}>
              <Button disabled={isSubmitting} onPress={() => void handleSubmit(submit)()}>
                {isSubmitting ? 'Saving…' : 'Save property'}
              </Button>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  addressLookup: {
    position: 'relative',
    zIndex: 10,
  },
  addressSuggestion: {
    backgroundColor: colours.white,
    borderBottomColor: colours.border,
    borderBottomWidth: 1,
    minHeight: 46,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  addressSuggestionPressed: {
    backgroundColor: '#E5F2EE',
  },
  addressSuggestionText: {
    color: colours.text,
    fontSize: 15,
  },
  addressSuggestions: {
    backgroundColor: colours.white,
    borderColor: colours.border,
    borderRadius: 12,
    borderWidth: 1,
    boxShadow: '0 12px 28px rgba(24, 53, 47, 0.14)',
    left: 0,
    maxHeight: 280,
    overflow: 'scroll',
    position: 'absolute',
    right: 0,
    top: 78,
    zIndex: 20,
  },
  actionButton: {
    flex: 1,
    minWidth: 150,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  choice: {
    backgroundColor: colours.white,
    borderColor: colours.border,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 11,
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
    color: colours.text,
    fontSize: 14,
    fontWeight: '600',
  },
  choiceTextSelected: {
    color: colours.white,
  },
  column: {
    flex: 1,
    minWidth: 180,
  },
  errorText: {
    color: colours.danger,
    fontSize: 14,
  },
  fieldGroup: {
    gap: 7,
  },
  form: {
    gap: 18,
  },
  label: {
    color: colours.text,
    fontSize: 14,
    fontWeight: '600',
  },
  lookupStatus: {
    color: colours.muted,
    fontSize: 13,
    marginTop: 6,
  },
  step: {
    color: colours.accent,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: colours.text,
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  twoColumns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
});
