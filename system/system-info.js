
MakeSafe('SystemInfo', {
    version: '0.1.0',
    engine : 'Electron',

    fs: {
        charset: 'utf-8'
    },

    specialThanks: {
        'Motezazer': {
            from : 'Real life',
            for  : 'Advices for creating NightOS, especially in security',
            use  : 'Improved a lot NightOS security, and how the system works !'
        },

        '@tmack': {
            from : 'StackOverflow',
            for  : 'Object.isCyclic function',
            use  : 'Created the `Object.safeFullFreeze` function'
        },

        '@Aidamina': {
            from : 'StackOverflow',
            for  : 'Way to make a variable safe',
            use  : 'Created the `MakeSafe` function, critical for NightOS security !'
        },

        '@Grafikart': {
            from : 'grafikart.fr',
            for  : 'His courses on web development',
            use  : 'Do I really have to precise ?'
        },

        '@maxogden': {
            from : 'GitHub',
            for  : 'Electron project',
            use  : 'Web engine which permit to run NightOS'
        },

        '@isaacs': {
            from : 'GitHub',
            for  : 'INI parser, Node Glob...',
            use  : 'Permitted to parse startup configuration file, perform queries on the hard drive..'
        }
    },

    teamThanks: {
        'jQuery': {
            for: 'Alternate DOM implementation',
            use:  'Designed `NightElement` class'
        },

        'Openclassrooms': {
            for: 'The help of the community + All the courses that permited me to progress',
            use: 'Permitted me to make this system ! Without them, NightOS wouldn\'t exist'
        },

        'Google Fonts': {
            for: 'All the "Open-Source" fonts I used to make NightOS',
            use: 'Fonts like `Roboto` or `Inconsolata`...'
        }
    }
});
