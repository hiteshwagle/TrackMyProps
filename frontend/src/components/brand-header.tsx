import { Image, StyleSheet, Text, View } from 'react-native';

import { colours } from '../theme';

const logo = require('../../assets/branding/trackmyprops-logo.png');

export function BrandHeader() {
  return (
    <View accessibilityRole="header" style={styles.container}>
      <Image
        accessibilityLabel="TrackMyProps logo"
        accessible
        resizeMode="contain"
        source={logo}
        style={styles.logo}
      />
      <Text style={styles.brandName}>TrackMyProps</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  brandName: {
    color: colours.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.45,
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  logo: {
    height: 38,
    width: 38,
  },
});
