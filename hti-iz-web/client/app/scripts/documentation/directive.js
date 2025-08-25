
angular.module('doc').directive('apiDocs', [
  function () {
    return {
      restrict: 'A',
      templateUrl: 'views/documentation/templates/ApiDocs.html',
      replace: false,
      controller: 'ApiDocsCtrl'
    };
  }
]);


angular.module('doc').directive('testcaseDoc', [
  function () {
    return {
      restrict: 'A',
      templateUrl: 'views/documentation/templates/TestCaseDoc.html',
      replace: false,
      controller: 'TestCaseDocumentationCtrl'
    };
  }
]);


angular.module('doc').directive('knownIssues', [
  function () {
    return {
      restrict: 'A',
      templateUrl: 'views/documentation/templates/KnownIssues.html',
      replace: false,
      controller: 'KnownIssuesCtrl'
    };
  }
]);

angular.module('doc').directive('releaseNotes', [
  function () {
    return {
      restrict: 'A',
      templateUrl: 'views/documentation/templates/ReleaseNotes.html',
      replace: false,
      controller: 'ReleaseNotesCtrl'
    };
  }
]);


angular.module('doc').directive('userDocs', [
  function () {
    return {
      restrict: 'A',
      templateUrl: 'views/documentation/templates/UserDocs.html',
      replace: false,
      controller: 'UserDocsCtrl'
    };
  }
]);


// angular.module('doc').directive('resourceDoc', [
//   function () {
//     return {
//       restrict: 'A',
//       scope: {
//         type: '@',
//         name: '@'
//       },
//       templateUrl: 'ResourceDoc.html',
//       replace: false,
//       controller: 'ResourceDocsCtrl'
//     };
//   }
// ]);

angular.module('doc').directive('installationGuide', [
  function () {
    return {
      restrict: 'A',
      templateUrl: 'views/documentation/templates/InstallationGuide.html',
      replace: false,
      controller: 'InstallationGuideCtrl'
    };
  }
]);


angular.module('doc').directive('toolDownloads', [
  function () {
    return {
      restrict: 'A',
      templateUrl: 'views/documentation/templates/ToolDownloadList.html',
      replace: false,
      controller: 'ToolDownloadListCtrl'
    };
  }
]);
