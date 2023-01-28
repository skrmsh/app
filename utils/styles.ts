import { StyleSheet } from 'react-native';
import { MD3Theme } from 'react-native-paper';

export const getStyles = (theme?: MD3Theme) =>
  StyleSheet.create({
    input: {
      height: 40,
      marginBottom: 8,
      padding: 12,
    },
    button: {
      margin: 12,
    },
    papertext: {
      color: '#ffffff',
    },
    done: {
      flex: 10,
      paddingLeft: 10,
      paddingRight: 10,
      marginTop: 10,
      backgroundColor: theme?.colors.primary,
    },
    extra: {
      flex: 10,
      paddingLeft: 10,
      paddingRight: 10,
      marginTop: 10,
      backgroundColor: '#ff8800',
    },
    todo: {
      flex: 10,
      paddingLeft: 10,
      paddingRight: 10,
      marginTop: 10,
      backgroundColor: theme?.colors.error,
    },
    visnone: {
      display: 'none',
    },
    vis: {
      display: 'flex',
      width: '94%',
      borderBottomEndL: 10,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      backgroundColor: '#ededed',
      marginLeft: 'auto',
      marginRight: 'auto',
      borderTopEndRadius: 0,
      padding: 20,
      marginBottom: 10,
    },
    expandbutton: {
      borderWidth: 1,
      flex: 2,
    },
    childcontainer: {
      borderWidth: 1,
    },
    cardcontent: {
      paddingLeft: 10,
      paddingRight: 10,
      marginTop: 10,
      marginBottom: 25,
    },
    image: {
      margin: 6,
    },
    separator: {
      marginVertical: 8,
      borderBottomColor: '#737373',
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
  });
