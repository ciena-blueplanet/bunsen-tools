module.exports = {
  fields: {
    fieldA: {
      label: 'somelabel',
      help: 'help'
    },
    fieldB: {
      label: 'someotherlabel',
      description: 'description'
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
          { model: 'somefield', description: '', label: '' },
          { model: 'someotherfield', description: '', label: '' },
          {
            model: 'somefieldset',
            collapsible: true,
            description: '',
            label: '',
            children: [
              { model: 'somefieldset_field', description: '', label: '' }
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
