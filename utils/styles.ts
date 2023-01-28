import { StyleSheet } from 'react-native';
import { MD2Theme } from 'react-native-paper';

export const getStyles = (theme?: MD2Theme) =>
  StyleSheet.create({
    cardcontent: {
      paddingLeft: 10,
      paddingRight: 10,
      marginTop: 10,
      marginBottom: 25,
    },
    image: {
      margin: 6,
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
    input: {
      height: 40,
      marginBottom: 8,
      padding: 12,
    },
    button: {
      margin: 8,
    },
    separator: {
      marginVertical: 8,
      borderBottomColor: '#737373',
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
  });
