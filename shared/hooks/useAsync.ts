import {useEffect, useState} from 'react';

export default function useAsync<T>(
  asyncFn: () => Promise<T>,
  dependencies: any[],
): T | undefined {
  let [state, setState] = useState<T | undefined>();

  useEffect(() => {
    let exec = async () => {
      let res = await asyncFn();
      setState(res);
    };

    exec();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return state;
}
