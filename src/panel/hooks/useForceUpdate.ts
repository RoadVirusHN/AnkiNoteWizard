import { useCallback, useState } from "react";

export const useForceUpdate = () => {
  const [, setValue] = useState({});
  // setValue({}) => always create a new reference empty object.
  return useCallback(() => setValue({}), []);
};