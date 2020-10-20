const setProperty = require('../utils/setProperty')('parameter');
const getContent = require('./content')('@paramBody');
const mapDescription = require('../utils/mapDescription');
const formParams = require('./formParams');

const REQUIRED = 'required';
const FORM_TYPE = 'form';

const formatExamples = (exampleValues = []) => exampleValues
  .reduce((exampleMap, example, i) => ({
    ...exampleMap,
    [`example${i + 1}`]: {
      summary: example.summary,
      value: example.value,
    },
  }), {});

const parseBodyParameter = (currentState, body, examples) => {
  const [name, ...extraOptions] = body.name.split('.');
  const isRequired = extraOptions.includes(REQUIRED);
  const hasForm = extraOptions.includes(FORM_TYPE);
  const [description, contentType] = mapDescription(body.description);
  const options = {
    name,
    required: isRequired,
    description,
  };

  let requestExamples;
  if (Array.isArray(examples) && examples.length > 0) {
    requestExamples = formatExamples(examples);
  }

  if (hasForm) {
    return formParams(currentState, name, body, isRequired, requestExamples);
  }

  return {
    ...currentState,
    description: setProperty(options, 'description', {
      type: 'string',
    }),
    required: setProperty(options, 'required', {
      type: 'boolean',
      defaultValue: false,
    }),
    content: {
      ...currentState.content,
      ...getContent(body.type, contentType, body.description, requestExamples),
    },
  };
};

const INITIAL_STATE = { content: {} };

const requestBodyGenerator = (params = [], examples) => {
  if (!params || !Array.isArray(params)) return {};
  const requestBody = params.reduce((acc, body) => (
    { ...acc, ...parseBodyParameter(acc, body, examples) }
  ), INITIAL_STATE);
  return requestBody;
};

module.exports = requestBodyGenerator;
