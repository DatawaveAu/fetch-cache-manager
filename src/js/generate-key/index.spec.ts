import generateKey from '.';
import { FetchOptions } from '..';
import { Agent } from '../agent/agents';
import getQueryParams from '../get-query-params';

describe('generateKey', () => {
   let agent: Pick<Agent, 'query' | 'headers'>;
   let options: FetchOptions;

   beforeEach(() => {
      agent = {
         query: [ { key: 'aqa', value: '01' } ],
         headers: [ { key: 'aha', value: '11' } ],
      };

      options = {
         query: [ { key: 'oqa', value: '21' } ],
         headers: [ { key: 'oha', value: '31' } ],
      };
   });

   it('should build the request key using method, url, query and headers sorting headers and queries by default', () => {
      agent.headers.push({ key: 'sort', value: '12' });

      const expected = {
         method: 'GET',
         url: 'some/api/path',
         queryParameters: 'aqa=01&oqa=21&pqa=41',
         headers: 'aha=11&oha=31&sort=12',

      };
      const path = 'some/api/path?pqa=41';
      const queryParams = getQueryParams({ agent, path, options });

      expect(generateKey({ agent, options, path, queryParams })).toEqual(JSON.stringify(expected));
   });

   it('should work with no query parameters or headers', () => {
      agent = { query: [], headers: [] };
      options = { query: [], headers: [] };
      const expected = {
         method: 'GET',
         url: 'some/api/path',
         queryParameters: '',
         headers: '',
      };
      const path = 'some/api/path';
      const queryParams = getQueryParams({ agent, path, options });

      expect(generateKey({ agent, options, path, queryParams })).toEqual(JSON.stringify(expected));
   });

   it('should allow to disable sorting', () => {
      const expected = {
         method: 'GET',
         url: 'some/api/path',
         queryParameters: 'oqa=21&pqa=41&aqa=01',
         headers: 'oha=31&aha=11',
      };

      options.cacheOptions = { keyOptions: { sortKeys: false, sortHeaders: false } };
      const path = 'some/api/path?pqa=41';
      const queryParams = getQueryParams({ agent, path, options });

      expect(generateKey({ agent, options, path, queryParams })).toEqual(JSON.stringify(expected));
   });

   it('should allow query params and headers coming from any of the 3 sources to be excluded from the key', () => {
      const expected = {
         method: 'GET',
         url: 'some/api/path',
         queryParameters: 'sample=99',
         headers: '',
      };

      options.cacheOptions = { keyOptions: { excludeQueryParams: [ 'aqa', 'oqa', 'pqa' ], excludeHeaders: [ 'aha', 'oha' ] } };
      const path = 'some/api/path?pqa=41&sample=99';
      const queryParams = getQueryParams({ agent, path, options });

      expect(generateKey({ agent, options, path, queryParams })).toEqual(JSON.stringify(expected));
   });

   describe('when  sending a POST message', () => {
      it('should add the body to the key', () => {
         options.method = 'POST';
         options.body = 'test body';

         const expected = {
            method: 'POST',
            url: 'some/api/path',
            queryParameters: 'aqa=01&oqa=21&pqa=41',
            headers: 'aha=11&oha=31',
            body: 'test body',
         };

         const path = 'some/api/path?pqa=41';
         const queryParams = getQueryParams({ agent, path, options });

         expect(generateKey({ agent, options, path, queryParams })).toEqual(JSON.stringify(expected));
      });
      it('should user empty string when no body is provided', () => {
         options.method = 'POST';

         const expected = {
            method: 'POST',
            url: 'some/api/path',
            queryParameters: 'aqa=01&oqa=21&pqa=41',
            headers: 'aha=11&oha=31',
            body: '',
         };
         const path = 'some/api/path?pqa=41';
         const queryParams = getQueryParams({ agent, path, options });

         expect(generateKey({ agent, options, path, queryParams })).toEqual(JSON.stringify(expected));
      });
   });
});
