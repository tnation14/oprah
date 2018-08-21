'use strict';

jest.mock('aws-sdk', () => {
  const getParameters = jest.fn();
  const SSM = jest.fn();

  SSM.mockImplementation(function() {
    this.getParameters = getParameters;
  });

  return {
    SSM,
    config: {
      setPromisesDependency: jest.fn(),
      update: jest.fn()
    }
  };
});

const AWS = require('aws-sdk');
const ssm = new AWS.SSM({});
ssm.getParameters
.mockImplementationOnce(() => ({
  promise: () => Promise.resolve({
    Parameters: [
      {
        Name: '/path/to/first',
        Value: '1st'
      },
      {
        Name: '/path/to/third',
        Value: '3rd'
      }
    ],
    InvalidParameters: [
      '/path/to/second'
    ]
  })
}));

const { getParameters } = require('../index');


describe('#getParameters - invalidParameters', () => {
  const request = () => getParameters({
    paths: [
      '/path/to/first',
      '/path/to/second',
      '/path/to/third',
    ]
  });

  it('should throw an error if there are invalid values', () => {
    return expect(request()).rejects.toThrow('Unable to fetch /path/to/second');
  });
});