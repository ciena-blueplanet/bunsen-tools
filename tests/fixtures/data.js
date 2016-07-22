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
