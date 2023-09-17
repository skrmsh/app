export function getHTTPUrl(serverHost: string, secureConnection: boolean) {
  console.log('Generating HTTP URL with', serverHost, secureConnection);
  return `http${secureConnection ? 's' : ''}://${serverHost}`;
}
export function getWSUrl(serverHost: string, secureConnection: boolean) {
  console.log('Generating WS URL with', serverHost, secureConnection);
  return `ws${secureConnection ? 's' : ''}://${serverHost}`;
}

/**
 * Checks if a given string is a valid server address.
 * For example olel.de:8081 or 192.168.0.75 are valid,
 * https://example.com or 10.0.0.1/foo are not valid!
 * @param serverHost the address to check
 * @returns true when the address is valid
 */
export function isValidHost(serverHost: string): boolean {
  return (
    /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]).){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(:\d+)?$/.test(
      serverHost,
    ) ||
    // eslint-disable-next-line no-useless-escape
    /^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])(:\d+)?$/.test(
      serverHost,
    )
  );
}
