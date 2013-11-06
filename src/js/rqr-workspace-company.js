require(['require-config'], function () {
    'use strict';

    // Show or hide login info
    require(['app/auth-logic']);

    // TODO: add to assemble
    require(['compability-fix'], function () {
        // {{#if conf.isProd}}
        require(['app/workspace/project-bundle-{{package.version}}.min']);
        // {{else}}
        require(['app/workspace/project']);
        // {{/if}}
    });
});