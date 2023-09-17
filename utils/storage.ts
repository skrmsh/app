import AsyncStorage from '@react-native-async-storage/async-storage';

export const getServerHostFromStorage = (
  callback: (e: string | null) => void,
) => {
  console.log('attempting ro retrieve server url from asyncStorage');
  AsyncStorage.getItem('@serverHost').then(foo => callback(foo));
};
export const storeServerHostInStorage = (url: string) => {
  AsyncStorage.setItem('@serverHost', url)
    .then(() => {
      if (url) {
        console.log('successfully saved server url');
      }
    })
    .catch(e => {
      console.log('error:', e);
    });
};

export const getSecureConnectionFromStorage = (
  callback: (e: boolean | null) => void,
) => {
  console.log(
    'attempting ro retrieve secure connection setting from asyncStorage',
  );
  AsyncStorage.getItem('@secureConnection').then(foo =>
    callback(foo === 'true'),
  );
};
export const storeSecureConnectionInStorage = (secureConnection: boolean) => {
  AsyncStorage.setItem('@secureConnection', secureConnection ? 'true' : 'false')
    .then(() => {
      console.log('successfully saved secure connection setting');
    })
    .catch(e => {
      console.log('error:', e);
    });
};
