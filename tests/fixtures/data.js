module.exports = {
  fields: {
    fieldA: {
      label: 'somelabel',
      help: 'help',
      prompt: 'test-prompt'
    },
    fieldB: {
      label: 'someotherlabel',
      description: 'description',
      placeholder: 'test-placeholder'
    },
    fieldC: {
    }
  },
  fieldWithTransforms: {
    label: 'test-field',
    type: 'string',
    modelTransform: {
      toObject: {
        id: 'value',
        something: '\'someliteral\'',
        label: 'label',
        otherId: 'id'
      }
    },
    viewTransform: {
      replace: {'\n': ','}
    }
  },
  fieldWithInstructions: {
    type: 'select',
    resourceType: 'tosca.resourceTypes.Network',
    labelAttribute: 'label-attr',
    instructor: 'vnfDomainId',
    label: 'Public Network',
    prompt: 'Please select a VNF Domain first',
    instructions: [
      {'type': 'filter', operator: 'byProvider', value: 'instructor'},
      {'and': {'type': 'filter', operator: 'equals', key: 'label', value: '\'public\''}},
      {'and': {'type': 'filter', operator: 'equals', key: 'properties.vPort', value: '\'1000\''}},
      {'or': {'type': 'filter', operator: 'contains', key: 'properties.port', value: 'properties.otherprop'}}
    ]
  },
  uiSchema2: {
    classNames: {
      cell: 'somecssclass'
    },
    children: [
      {
        children: [
          {
            model: 'label'
          },
          {
            model: 'description'
          },
          {
            model: 'autoClean'
          }
        ],
        label: 'General'
      },
      {
        label: 'somename',
        children: [
          { model: 'properties.somefield', label: 'test-field-label' },
          { model: 'properties.someotherfield', description: 'test-field-desc' },
          { model: 'properties.anotherfield' },
          {
            model: 'properties.somefieldset',
            collapsible: true,
            description: 'test-description',
            label: 'test-label',
            children: [
              { model: 'properties.somefieldset_field', description: 'test-field-help' }
            ]
          }
        ]
      }
    ]
  },
  uiSchema1: {
    'somekey': {
      cssClass: 'somecssclass',
      fieldGroups: [
        {
          name: 'somename',
          fields: {
            'somefield': { label: 'test-field-label' },
            'someotherfield': { description: 'test-field-desc' },
            'anotherfield': {}
          },
          fieldsets: {
            'somefieldset': {
              label: 'test-label',
              description: 'test-description',
              fields: { 'somefieldset_field': { help: 'test-field-help' } }
            }
          }
        }
      ]
    }
  },
  fieldsets: {
    '_fieldSetA': {
      label: 'Alabel',
      help: 'Ahelp',
      switch: true,
      fields: { cellA: {label: 'cellAlabel'} }
    },
    '_fieldSetB': {
      label: 'Blabel',
      description: 'Bdescription',
      switch: false,
      fields: { cellB: {label: 'cellBlabel'} }
    }
  }
}
