module.exports = {
  extends: ['stylelint-config-standard'],
  rules: {
    'color-no-invalid-hex': true,
    'property-no-unknown': true,
    'selector-class-pattern': [
      '^[a-z]+(-[a-z0-9]+)*(__[a-z0-9]+)?(--[a-z0-9]+)?$',
      {
        message:
          'Class names should follow the c-block__element--modifier pattern'
      }
    ],
    'no-descending-specificity': null,
    'custom-property-empty-line-before': null
  }
};
