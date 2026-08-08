import { StyleSheet, Text } from 'react-native';

import { BodyText, Button, Card, Page, PageTitle } from '../../src/components/ui';
import { colours } from '../../src/theme';

export default function PropertiesScreen() {
  return (
    <Page>
      <PageTitle>Properties</PageTitle>
      <BodyText>
        Active properties will appear here. Sold properties will move to the Archived tab.
      </BodyText>
      <Card>
        <Text style={styles.heading}>No properties yet</Text>
        <BodyText>
          The two-step property form will be enabled after its contracts, owner isolation,
          migration, and backend endpoint are implemented.
        </BodyText>
        <Button disabled onPress={() => undefined}>
          Add property
        </Button>
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: colours.text,
    fontSize: 22,
    fontWeight: '700',
  },
});
