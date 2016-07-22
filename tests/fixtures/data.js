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
