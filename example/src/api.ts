// @ts-ignore
import qs from 'qs';

const baseUrl = 'https://jsonplaceholder.typicode.com';

function api<ParamsT, BodyT, HeadersT>({
  path,
  params,
  method = 'GET',
  body,
  headers,
}: {
  path: string;
  params?: ParamsT;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: BodyT;
  headers?: HeadersT;
}) {
  const paramsAsString = params
    ? `?${qs.stringify(params, { arrayFormat: 'repeat' })}`
    : '';
  const fullPath = `${baseUrl}/${path}${paramsAsString}`;
  let options = {
    method,
    body,
    headers,
  };
  return pureFetch(fullPath, options);
}

function pureFetch<OptionsT>(url: string, options: OptionsT) {
  return new Promise((resolve, reject) =>
    fetch(url, options as any)
      .then((response) => {
        // if response is something outside of 200 like 500, 400 throw an error

        if (!response.ok) {
          const { status, statusText } = response;
          throw {
            status,
            statusText,
          };
        }
        return response.json();
      })
      .then((content) => {
        resolve(content);
      })
      .catch((error) => {
        console.log('error', url, error);
        reject(error);
      })
  );
}

export default api;
