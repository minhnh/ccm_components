ccm.files[ "html.js" ] = {
  'main': {
    'inner': [
      { 'id': 'header' },
      { 'id': 'article', 'class': 'p-2' },
      { 'id': 'feedback' },
      { 'id': 'footer' }
    ]
  },

  // HTML configuration for navigation bar
  'navigation': {
    'tag': 'nav',
    'class': 'navbar navbar-expand-md navbar-dark bg-info pb-2',
    'id': 'navigation-bar',
    'inner': [
      // navbar brand
      {
        'tag': 'a', 'class': "navbar-brand", 'href': "#", 'id': "course-name",
        'onclick': '%course-name-click%', 'inner': '%course-name%'
      },

      // collapsible button for when screen width is small
      {
        'tag': 'button', 'class': 'navbar-toggler', 'type': 'button', 'data-toggle': 'collapse',
        'data-target': '#navbarSupportedContent', 'aria-controls': 'navbarSupportedContent',
        'aria-expanded': 'false', 'aria-label': 'Toggle navigation',
        'inner': [ { 'tag': 'span', 'class': 'navbar-toggler-icon' } ]
      },

      // collapsible content div
      {
        'class': 'collapse navbar-collapse',
        'id': 'navbarSupportedContent',
        'inner': [
          // left side navigation buttons
          {
            'tag': 'ul', 'class': 'navbar-nav mr-auto',
            'inner': [
              // Home button
              {
                'tag': 'li', 'class': 'nav-item active',
                'inner': [ {
                  'tag': 'a', 'href': '#', 'class': 'nav-link', 'title': 'Home', 'id': 'home',
                  'inner': '<i class="fa fa-home"></i><span class="sr-only">Home</span>',
                  'onclick': '%home-click%'
                } ]
              },

              // Help button
              {
                'tag': 'li', 'class': 'nav-item',
                'inner': [ {
                  'tag': 'a', 'href': '#', 'class': 'nav-link', 'title': 'Help', 'id': 'help',
                  'inner': '<i class="fa fa-info-circle"></i><span class="sr-only">Help</span>'
                } ]
              }
            ]
          },
          // username field and login/logout buttons to the right
          { 'tag': 'ul', 'class': 'navbar-nav', 'id': 'login-area' }
        ]
      }  // end navbar collapsible content
    ]
  },

  // HTML configuration for accordion-style section menu
  'section': {
    'class': 'card', 'id': 's-%section_id%',
    'inner': [
      {
        'id': 's-%section_id%-header', 'class': 'card-header bg-info',
        // button link containing the section title
        'inner': [ {
          'tag': 'button', 'class': 'btn btn-link text-white collapsed', 'data-toggle': 'collapse',
          'aria-expanded': 'true',  'data-target': '#s-%section_id%-body', 'aria-controls': 's-%section_id%-body',
          'inner': '<h5 class=\"mb-0\">%section-title%</h5>', 'id': 's-%section_id%-button'
        } ]
      },
      {
        'id': 's-%section_id%-body', 'class': 'collapse',
        'aria-labelledby': 's-%section_id%-header',
        'inner': [ { 'id': 's-%section_id%-body-content', 'class': 'card-body' } ]
      }
    ]
  },

  // HTML configuration for each menu entry
  'entry': {
    'inner': [
      // fontawesome icon
      { 'tag': 'span', 'inner': [ { 'tag': 'i', 'class': 'fa %icon% text-info' } ] },
      // button link that load entry content
      { 'tag': 'button', 'class': 'btn btn-link', 'type': 'button', 'inner': '%title%', 'onclick': '%click%' }
    ]
  },

  'login_button': {
    'tag': 'li', 'class': 'nav-item pl-1',
    'inner': {
      'tag': 'button', 'type': 'button', 'class': 'btn btn-light',
      'inner': '%label%', 'onclick': '%click%'
    }
  },

  'user_info': {
    'tag': 'li', 'class': 'nav-item text-white pt-1', 'inner': [
      { 'tag': 'i', 'class': 'fa fa-user p-1' },
      { 'tag': 'span', 'id': 'username', 'class': 'p-1', 'inner': '%username%' },
      { 'tag': 'a', 'id': 'user-role', 'class': 'p-1 badge-info', 'inner': '(%role%)', 'onclick': '%click%' }
    ]
  },

  // message to display when user is not logged in
  'alert_message': { 'class': 'alert alert-%type%', 'role': 'alert', 'inner': '%message%\n' }
};