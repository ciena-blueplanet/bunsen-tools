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
        label: 'somename',
        children: [
          { model: 'properties.somefield', description: '', label: '' },
          { model: 'properties.someotherfield', description: '', label: '' },
          {
            model: 'properties.somefieldset',
            collapsible: true,
            description: '',
            label: '',
            children: [
              { model: 'properties.somefieldset_field', description: '', label: '' }
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
            'somefield': {},
            'someotherfield': {}
          },
          fieldsets: {
            'somefieldset': {
              fields: { 'somefieldset_field': {} }
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
