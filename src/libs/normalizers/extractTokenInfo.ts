/**
 * Extracts token information from a given token object.
 * @param tokenObject - The token object to extract information from.
 * @returns An object containing the address and objectAddress of the token.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const extractTokenInfo = (tokenObject: any) => {
  if (!tokenObject) return { address: '', objectAddress: '' };
  
  const objectAddress = tokenObject.inner || tokenObject;
  return {
    address: objectAddress,
    objectAddress: objectAddress,
  };
};