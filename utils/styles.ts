import { StyleSheet } from 'react-native';
import { MD3Theme } from 'react-native-paper';

export const getStyles = (theme?: MD3Theme) => {
  return StyleSheet.create({
    input: {
      height: 40,
      marginBottom: 8,
      padding: 12,
      borderColor: theme?.colors.primary,
    },
    button: {
      margin: 12,
    },
    buttonContained: {
      margin: 12,
      color: theme?.colors.onPrimary,
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
      backgroundColor: theme?.colors.primary,
    },
    visnone: {
      display: 'none',
    },
    vis: {
      display: 'flex',
      width: '100%',
      borderBottomEndL: 10,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      backgroundColor: theme?.colors.background,
      marginLeft: 'auto',
      marginRight: 'auto',
      top: -10,
      zIndex: -10,
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
    container: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    loginCard: {
      marginTop: 15,
      minWidth: '94%',
      padding: 10,
    },
    cardcontent: {
      paddingLeft: 10,
      paddingRight: 10,
      marginTop: 10,
      marginBottom: 10,
    },
    image: {
      margin: 6,
    },
    phasorimage: {
      width: 50,
    },
    heading: {
      marginLeft: 10,
      marginRight: 10,
      marginTop: 10,
      height: 30,
      fontSize: 23,
      fontWeight: 'bold',
      textAlign: 'left',
    },
    separator: {
      marginVertical: 8,
      borderBottomColor: '#737373',
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    coverAvatar: {
      height: 200,
      width: 200,
      borderRadius: 2,
      margin: 8,
    },
    loginLogo: {
      borderRadius: 14,
      margin: 10,
      height: 200,
      width: 200,
      alignItems: 'center',
      justifyContent: 'center',
    },
    appbarLogo: {
      width: 360,
      height: 160,
    },
    centerContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme?.colors.background,
    },
    marginTop: {
      marginTop: 15,
    },
    mT30: {
      marginTop: 30,
    },
    pL15: {
      paddingLeft: 15,
    },
    mB20: {
      marginBottom: 20,
    },
    m10: {
      margin: 10,
    },
    m15: {
      margin: 15,
    },
    height100: {
      height: '100%',
    },
    mT10: {
      marginTop: 10,
    },
    mR40: {
      marginRight: 40,
    },

    mTLR10: {
      marginLeft: 10,
      marginRight: 10,
      marginTop: 10,
    },
    alignSelfFlexEnd: {
      alignSelf: 'flex-end',
    },
    centerAll: {
      alignContent: 'center',
      justifyContent: 'center',
      alignItems: 'center',
    },
    fab: {
      position: 'absolute',
      margin: 20,
      right: 0,
      bottom: 0,
      zIndex: 3,
      elevation: 3,
      backgroundColor: theme?.colors.primary,
    },
    connectionCard: {
      minWidth: '94%',
      maxWidth: '94%',
      marginBottom: 10,
      padding: 10,
      left: 10,
      justifyContent: 'center',
    },
    cardSmall: {
      margin: 15,
      minHeight: 180,
      width: 185,
    },
    inline: {
      display: 'flex',
      flexDirection: 'row',
      alignContent: 'center',
    },
    stackNavHeader: {
      backgroundColor: theme?.colors.primary,
    },
    modalContainer: {
      backgroundColor: theme?.colors.background,
      padding: 20,
      margin: 50,
      borderRadius: 15,
      alignContent: 'center',
      alignItems: 'center',
    },
    dialog: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    flex_0: {
      flex: 0,
    },
    flex_1: {
      flex: 1,
    },
    background_primary: {
      backgroundColor: '#e91e62',
    },
    background_color: {
      backgroundColor: theme?.colors.background,
    },
  });
};
