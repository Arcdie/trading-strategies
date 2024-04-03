const axios = require('axios');

const isObjectEmpty = (obj) => Object.keys(obj).length === 0;

const makeRequest = async(method, url, settings = {}) => {
  if (settings.data && isObjectEmpty(settings.data)) {
    delete settings.data;
  }

  if (settings.params && isObjectEmpty(settings.params)) {
    delete settings.params;
  }

  return axios({ method, url, ...settings });
};

exports.makeGetRequest = (url, queryParams = {}, settings = {}) =>
  makeRequest('GET', url, { params: queryParams, ...settings });

exports.makePostRequest = (url, body = {}, settings = {}) =>
  makeRequest('POST', url, { data: body, ...settings });

exports.makePutRequest = (url, body = {}, settings = {}) =>
  makeRequest('PUT', url, { data: body, ...settings });

exports.makeDeleteRequest = (url, body = {}, settings = {}) =>
  makeRequest<T>('DELETE', url, { data: body, ...settings });
