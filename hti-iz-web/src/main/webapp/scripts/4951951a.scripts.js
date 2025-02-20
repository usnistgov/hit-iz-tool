angular.module("hit-settings", [ "common" ]);

angular.module("commonServices", []);

angular.module("common", [ "ngResource", "default", "xml", "hl7v2-edi", "hl7v2", "edi", "soap", "hit-util" ]);

angular.module("main", [ "common" ]);

angular.module("account", [ "common" ]);

angular.module("cf", [ "common" ]);

angular.module("doc", [ "common" ]);

angular.module("cb", [ "common" ]);

angular.module("envelope", [ "soap" ]);

angular.module("connectivity", [ "soap" ]);

angular.module("hit-tool-directives", []);

angular.module("hit-tool-services", [ "common" ]);

angular.module("documentation", []);

angular.module("domains", []);

angular.module("logs", [ "common" ]);

angular.module("transport", []);

var app = angular.module("hit-app", [ "ngRoute", "ui.bootstrap", "ngCookies", "LocalStorageModule", "ngResource", "ngSanitize", "ngIdle", "ngAnimate", "ui.bootstrap", "angularBootstrapNavTree", "QuickList", "hit-util", "format", "soap", "default", "hl7v2-edi", "xml", "hl7v2", "edi", "soap", "envelope", "connectivity", "cf", "cb", "ngTreetable", "hit-tool-directives", "hit-tool-services", "commonServices", "smart-table", "doc", "account", "main", "hit-vocab-search", "hit-profile-viewer", "hit-validation-result", "hit-report-viewer", "hit-testcase-details", "hit-testcase-tree", "hit-dqa", "hit-settings", "documentation", "hit-manual-report-viewer", "ui-notification", "angularFileUpload", "ociFixedHeader", "ngFileUpload", "ui.tree", "ui.select", "hit-edit-testcase-details", "domains", "logs", "transport" ]);

var httpHeaders, loginMessage, spinner, mToHide = [ "usernameNotFound", "emailNotFound", "usernameFound", "emailFound", "loginSuccess", "userAdded", "uploadImageFailed" ];

var msg = {};

app.config(function($routeProvider, $httpProvider, localStorageServiceProvider, KeepaliveProvider, IdleProvider, NotificationProvider, $provide, $locationProvider) {
    $locationProvider.hashPrefix("");
    localStorageServiceProvider.setPrefix("hit-app").setStorageType("sessionStorage");
    $routeProvider.when("/", {
        templateUrl: "views/welcome.html"
    }).when("/:domain/home", {
        templateUrl: "views/home.html"
    }).when("/onc", {
        redirectTo: "/onc/home"
    }).when("/svap", {
        redirectTo: "/svap/home"
    }).when("/:domain/doc", {
        templateUrl: "views/documentation/documentation.html"
    }).when("/:domain/setting", {
        templateUrl: "views/setting.html"
    }).when("/:domain/about", {
        templateUrl: "views/about.html"
    }).when("/:domain/contact", {
        templateUrl: "views/contact.html"
    }).when("/:domain/soapEnv", {
        templateUrl: "views/envelope/envelope.html"
    }).when("/:domain/soapConn", {
        templateUrl: "views/connectivity/connectivity.html"
    }).when("/:domain/cf", {
        templateUrl: "views/cf/cf.html"
    }).when("/:domain/cb", {
        templateUrl: "views/cb/cb.html"
    }).when("/:domain/blank", {
        templateUrl: "blank.html"
    }).when("/:domain/error", {
        templateUrl: "error.html"
    }).when("/:domain/transport", {
        templateUrl: "views/transport/transport.html"
    }).when("/:domain/forgotten", {
        templateUrl: "views/account/forgotten.html",
        controller: "ForgottenCtrl"
    }).when("/:domain/registration", {
        templateUrl: "views/account/registration.html",
        controller: "RegistrationCtrl"
    }).when("/:domain/useraccount", {
        templateUrl: "views/account/userAccount.html"
    }).when("/:domain/glossary", {
        templateUrl: "views/glossary.html"
    }).when("/:domain/resetPassword", {
        templateUrl: "views/account/registerResetPassword.html",
        controller: "RegisterResetPasswordCtrl",
        resolve: {
            isFirstSetup: function() {
                return false;
            }
        }
    }).when("/:domain/registrationSubmitted", {
        templateUrl: "views/account/registrationSubmitted.html"
    }).when("/:domain/uploadTokens", {
        templateUrl: "views/home.html",
        controller: "UploadTokenCheckCtrl"
    }).when("/:domain/addprofiles", {
        redirectTo: "/cf"
    }).when("/:domain/saveCBTokens", {
        templateUrl: "views/home.html",
        controller: "UploadCBTokenCheckCtrl"
    }).when("/:domain/addcbprofiles", {
        templateUrl: "views/home.html",
        controller: "UploadCBTokenCheckCtrl"
    }).when("/:domain/domains", {
        templateUrl: "views/domains/domains.html"
    }).when("/:domain/logs", {
        templateUrl: "views/logs/logs.html"
    }).otherwise({
        redirectTo: "/"
    });
    $httpProvider.interceptors.push("interceptor1");
    $httpProvider.interceptors.push("interceptor2");
    $httpProvider.interceptors.push("interceptor3");
    $httpProvider.interceptors.push("interceptor4");
    IdleProvider.idle(7200);
    IdleProvider.timeout(30);
    KeepaliveProvider.interval(10);
    NotificationProvider.setOptions({
        delay: 3e4,
        maxCount: 1
    });
    httpHeaders = $httpProvider.defaults.headers;
    $provide.decorator("nvFileOverDirective", [ "$delegate", function($delegate) {
        var directive = $delegate[0], link = directive.link;
        directive.compile = function() {
            return function(scope, element, attrs) {
                var overClass = attrs.overClass || "nv-file-over";
                link.apply(this, arguments);
                element.on("dragleave", function() {
                    element.removeClass(overClass);
                });
            };
        };
        return $delegate;
    } ]);
});

app.factory("interceptor1", function($q, $rootScope, $location, StorageService, $window) {
    var handle = function(response) {
        if (response.status === 440) {
            response.data = "Session timeout";
            $rootScope.openSessionExpiredDlg();
        } else if (response.status === 498) {
            response.data = "Invalid Application State";
            $rootScope.openVersionChangeDlg();
        }
    };
    return {
        responseError: function(response) {
            handle(response);
            return $q.reject(response);
        }
    };
});

app.factory("interceptor2", function($q, $rootScope, $location, StorageService, $window) {
    return {
        response: function(response) {
            return response || $q.when(response);
        },
        responseError: function(response) {
            if (response.status === 401) {
                if (response.config.url !== "api/accounts/cuser") {
                    if (response.config.url !== "api/accounts/login") {
                        var deferred = $q.defer(), req = {
                            config: response.config,
                            deferred: deferred
                        };
                        $rootScope.requests401.push(req);
                    }
                    $rootScope.$broadcast("event:loginRequired");
                    return $q.when(response);
                }
            }
            return $q.reject(response);
        }
    };
});

app.factory("interceptor3", function($q, $rootScope, $location, StorageService, $window) {
    return {
        response: function(response) {
            spinner = false;
            return response || $q.when(response);
        },
        responseError: function(response) {
            spinner = false;
            return $q.reject(response);
        }
    };
});

app.factory("interceptor4", function($q, $rootScope, $location, StorageService, $window) {
    var setMessage = function(response) {
        if (response.data && response.data.text && response.data.type) {
            if (response.status === 401) {
                loginMessage = {
                    text: response.data.text,
                    type: response.data.type,
                    skip: response.data.skip,
                    show: true,
                    manualHandle: response.data.manualHandle
                };
            } else if (response.status === 503) {
                msg = {
                    text: "server.down",
                    type: "danger",
                    show: true,
                    manualHandle: true
                };
            } else {
                msg = {
                    text: response.data.text,
                    type: response.data.type,
                    skip: response.data.skip,
                    show: true,
                    manualHandle: response.data.manualHandle
                };
                var found = false;
                var i = 0;
                while (i < mToHide.length && !found) {
                    if (msg.text === mToHide[i]) {
                        found = true;
                    }
                    i++;
                }
                if (found === true) {
                    msg.show = false;
                } else {}
            }
        }
    };
    return {
        response: function(response) {
            setMessage(response);
            return response || $q.when(response);
        },
        responseError: function(response) {
            setMessage(response);
            return $q.reject(response);
        }
    };
});

app.factory("myService", function(Session, $rootScope, $location, $modal, TestingSettings, AppInfo, $q, $sce, $templateCache, $compile, StorageService, $window, $route, $timeout, $http, User, Idle, Transport, IdleService, userInfoService, base64, Notification, $filter, $routeParams, DomainsManager) {
    return {
        initData: function(domainChosen) {
            StorageService.set(StorageService.ACTIVE_SUB_TAB_KEY, null);
            $rootScope.appLoad = function(domainParam) {
                if (domainParam === undefined) {
                    domainParam = $location.search()["d"] ? decodeURIComponent($location.search()["d"]) : null;
                }
                AppInfo.get().then(function(appInfo) {
                    $rootScope.loadingDomain = true;
                    $rootScope.appInfo = appInfo;
                    $rootScope.apiLink = $rootScope.appInfo.url + $rootScope.appInfo.apiDocsPath;
                    httpHeaders.common["rsbVersion"] = appInfo.rsbVersion;
                    var previousToken = StorageService.get(StorageService.APP_STATE_TOKEN);
                    if (previousToken != null && previousToken !== appInfo.rsbVersion) {
                        $rootScope.openVersionChangeDlg();
                    }
                    StorageService.set(StorageService.APP_STATE_TOKEN, appInfo.rsbVersion);
                    if (domainParam != undefined && domainParam != null) {
                        StorageService.set(StorageService.APP_SELECTED_DOMAIN, domainParam);
                    }
                    var storedDomain = StorageService.get(StorageService.APP_SELECTED_DOMAIN);
                    var domainFound = null;
                    $rootScope.domain = null;
                    $rootScope.appInfo.selectedDomain = null;
                    $rootScope.domainsByOwner = {
                        my: [],
                        others: []
                    };
                    DomainsManager.getDomains().then(function(domains) {
                        $rootScope.appInfo.domains = domains;
                        if ($rootScope.appInfo.domains != null) {
                            $rootScope.initDomainsByOwner();
                            if ($rootScope.appInfo.domains.length === 1) {
                                domainFound = $rootScope.appInfo.domains[0].domain;
                            } else if (storedDomain != null) {
                                $rootScope.appInfo.domains = $filter("orderBy")($rootScope.appInfo.domains, "position");
                                for (var i = 0; i < $rootScope.appInfo.domains.length; i++) {
                                    if ($rootScope.appInfo.domains[i].domain === storedDomain) {
                                        domainFound = $rootScope.appInfo.domains[i].domain;
                                        break;
                                    }
                                }
                            }
                            if (domainFound == null) {
                                for (var i = 0; i < $rootScope.appInfo.domains.length; i++) {
                                    if ($rootScope.appInfo.domains[i].domain === "default") {
                                        domainFound = $rootScope.appInfo.domains[i].domain;
                                        break;
                                    }
                                }
                                if (domainFound == null) {
                                    $rootScope.appInfo.domains = $filter("orderBy")($rootScope.appInfo.domains, "position");
                                    domainFound = $rootScope.appInfo.domains[0].domain;
                                }
                            }
                            $rootScope.clearDomainSession();
                            DomainsManager.getDomainByKey(domainFound).then(function(result) {
                                $rootScope.appInfo.selectedDomain = result.domain;
                                StorageService.set(StorageService.APP_SELECTED_DOMAIN, result.domain);
                                $rootScope.domain = result;
                                $rootScope.loadingDomain = false;
                                $timeout(function() {
                                    Transport.configs = {};
                                    Transport.getDomainForms($rootScope.domain.domain).then(function(transportForms) {
                                        $rootScope.transportSupported = transportForms != null && transportForms.length > 0;
                                        if ($rootScope.transportSupported) {
                                            angular.forEach(transportForms, function(transportForm) {
                                                var protocol = transportForm.protocol;
                                                if (!Transport.configs[protocol]) {
                                                    Transport.configs[protocol] = {};
                                                }
                                                if (!Transport.configs[protocol]["forms"]) {
                                                    Transport.configs[protocol]["forms"] = {};
                                                }
                                                Transport.configs[protocol]["forms"] = transportForm;
                                                Transport.configs[protocol]["error"] = null;
                                                Transport.configs[protocol]["description"] = transportForm.description;
                                                Transport.configs[protocol]["key"] = transportForm.protocol;
                                                Transport.getConfigData($rootScope.domain.domain, protocol).then(function(data) {
                                                    Transport.configs[protocol]["data"] = data;
                                                    Transport.configs[protocol]["open"] = {
                                                        ta: true,
                                                        sut: false
                                                    };
                                                }, function(error) {
                                                    Transport.configs[protocol]["error"] = error.data;
                                                });
                                            });
                                        }
                                    }, function(error) {
                                        $scope.error = "No transport configs found.";
                                    });
                                }, 500);
                            }, function(error) {
                                $rootScope.loadingDomain = true;
                                $rootScope.openUnknownDomainDlg();
                            });
                        } else {
                            $rootScope.openCriticalErrorDlg("No Tool scope found. Please contact the administrator");
                        }
                    }, function(error) {
                        $rootScope.openCriticalErrorDlg("No Tool scope found. Please contact the administrator");
                    });
                }, function(error) {
                    $rootScope.loadingDomain = true;
                    $rootScope.appInfo = {};
                    $rootScope.openCriticalErrorDlg("Failed to fetch the server. Please try again");
                });
            };
            if (domainChosen !== null) {
                var domainParam;
                if (domainChosen === undefined) {
                    domainParam = $location.search()["d"] ? decodeURIComponent($location.search()["d"]) : null;
                } else {
                    domainParam = domainChosen;
                }
                $rootScope.appLoad(domainParam);
            }
        }
    };
});

app.run(function(myService, $rootScope, $location, StorageService, userInfoService, User, $route, $window, base64, $http, Notification) {
    $rootScope.clearDomainSession = function() {
        StorageService.set(StorageService.ISOLATED_EDITOR_CONTENT_KEY, null);
        StorageService.set(StorageService.ISOLATED_SELECTED_TESTCASE_TYPE_KEY, null);
        StorageService.set(StorageService.CB_SELECTED_TESTPLAN_ID_KEY, null);
        StorageService.set(StorageService.CB_SELECTED_TESTPLAN_TYPE_KEY, null);
        StorageService.set(StorageService.CB_SELECTED_TESTPLAN_SCOPE_KEY, null);
        StorageService.set(StorageService.CB_MANAGE_SELECTED_TESTCASE_ID_KEY, null);
        StorageService.set(StorageService.CB_MANAGE_SELECTED_TESTCASE_TYPE_KEY, null);
        StorageService.set(StorageService.CB_MANAGE_LOADED_TESTCASE_ID_KEY, null);
        StorageService.set(StorageService.CB_MANAGE_LOADED_TESTCASE_TYPE_KEY, null);
        StorageService.set(StorageService.CB_MANAGE_LOADED_TESTSTEP_TYPE_KEY, null);
        StorageService.set(StorageService.CB_MANAGE_LOADED_TESTSTEP_ID_KEY, null);
        StorageService.set(StorageService.CB_MANAGE_SELECTED_TESTPLAN_ID_KEY, null);
        StorageService.set(StorageService.CB_MANAGE_SELECTED_TESTPLAN_TYPE_KEY, null);
        StorageService.set(StorageService.CB_MANAGE_SELECTED_TESTPLAN_SCOPE_KEY, null);
        StorageService.set(StorageService.APP_SELECTED_DOMAIN, null);
        StorageService.set(StorageService.CF_SELECTED_TESTPLAN_ID_KEY, null);
        StorageService.set(StorageService.CF_EDITOR_CONTENT_KEY, null);
        StorageService.set(StorageService.CF_LOADED_TESTCASE_ID_KEY, null);
        StorageService.set(StorageService.CB_EDITOR_CONTENT_KEY, null);
        StorageService.set(StorageService.CB_SELECTED_TESTCASE_TYPE_KEY, null);
        StorageService.set(StorageService.CB_LOADED_TESTCASE_ID_KEY, null);
        StorageService.set(StorageService.CB_LOADED_TESTCASE_TYPE_KEY, null);
        StorageService.set(StorageService.CB_LOADED_TESTSTEP_TYPE_KEY, null);
        StorageService.set(StorageService.CB_LOADED_TESTSTEP_ID_KEY, null);
        StorageService.set(StorageService.ISOLATED_EDITOR_CONTENT_KEY, null);
        StorageService.set(StorageService.ISOLATED_SELECTED_TESTCASE_TYPE_KEY, null);
        StorageService.set(StorageService.CB_SELECTED_TESTPLAN_ID_KEY, null);
        StorageService.set(StorageService.CB_SELECTED_TESTPLAN_TYPE_KEY, null);
        StorageService.set(StorageService.CB_SELECTED_TESTPLAN_SCOPE_KEY, null);
        StorageService.set(StorageService.CF_SELECTED_TESTPLAN_SCOPE_KEY, null);
        StorageService.set(StorageService.CF_SELECTED_TESTPLAN_ID_KEY, null);
        StorageService.set(StorageService.CF_SELECTED_TESTPLAN_TYPE_KEY, null);
        StorageService.set(StorageService.CB_MANAGE_SELECTED_TESTCASE_ID_KEY, null);
        StorageService.set(StorageService.CB_MANAGE_SELECTED_TESTCASE_TYPE_KEY, null);
        StorageService.set(StorageService.CB_MANAGE_LOADED_TESTCASE_ID_KEY, null);
        StorageService.set(StorageService.CB_MANAGE_LOADED_TESTCASE_TYPE_KEY, null);
        StorageService.set(StorageService.CB_MANAGE_LOADED_TESTSTEP_TYPE_KEY, null);
        StorageService.set(StorageService.CB_MANAGE_LOADED_TESTSTEP_ID_KEY, null);
        StorageService.set(StorageService.CB_MANAGE_SELECTED_TESTPLAN_ID_KEY, null);
        StorageService.set(StorageService.CB_MANAGE_SELECTED_TESTPLAN_TYPE_KEY, null);
        StorageService.set(StorageService.CB_MANAGE_SELECTED_TESTPLAN_SCOPE_KEY, null);
        StorageService.set(StorageService.APP_SELECTED_DOMAIN, null);
        StorageService.set(StorageService.CB_TEST_PLANS, []);
        StorageService.set(StorageService.CB_LOADED_TESTCASE_ID_KEY, null);
        StorageService.set(StorageService.ACTIVE_SUB_TAB_KEY, null);
        StorageService.set(StorageService.TEST_STEP_EXECUTION_MESSAGES_KEY, null);
        StorageService.set(StorageService.TEST_STEP_VALIDATION_REPORTS_KEY, null);
        StorageService.set(StorageService.TEST_STEP_MESSAGE_TREES_KEY, null);
        StorageService.set(StorageService.TEST_STEP_VALIDATION_RESULTS_KEY, null);
        StorageService.set(StorageService.TEST_STEP_EXECUTION_STATUSES_KEY, null);
        StorageService.set(StorageService.CB_SELECTED_TESTCASE_ID_KEY, null);
        StorageService.set(StorageService.TEST_CASE_EXECUTION_STATUSES_KEY, null);
        StorageService.set(StorageService.TEST_CASE_VALIDATION_RESULTS_KEY, null);
    };
    $rootScope.clearDomainSession();
    $rootScope.domainIdToName = function(domainId) {
        if (domainId === "iz") {
            return "onc";
        } else if (domainId === "iz-hti-1-svap") {
            return "svap";
        }
    };
    $rootScope.stackPosition = 0;
    $rootScope.transportSupported = false;
    $rootScope.scrollbarWidth = null;
    $rootScope.vcModalInstance = null;
    $rootScope.sessionExpiredModalInstance = null;
    $rootScope.errorModalInstanceInstance = null;
    function getContextPath() {
        return $window.location.pathname.substring(0, $window.location.pathname.indexOf("/", 2));
    }
    var initUser = function(user) {
        userInfoService.setCurrentUser(user);
        User.initUser(user);
    };
    $rootScope.selectDomain = function(domain) {
        if (domain != null) {
            StorageService.set(StorageService.APP_SELECTED_DOMAIN, domain);
            $location.search("d", domain);
            $rootScope.reloadPage();
        }
    };
    $rootScope.reloadPage = function() {
        $window.location.reload();
    };
    $rootScope.$watch(function() {
        return $location.path();
    }, function(newLocation, oldLocation) {
        if ($rootScope.activePath === newLocation) {
            var back, historyState = $window.history.state;
            back = !!(historyState && historyState.position <= $rootScope.stackPosition);
            if (back) {
                $rootScope.stackPosition--;
            } else {
                $rootScope.stackPosition++;
            }
        } else {
            if ($route.current) {
                $window.history.replaceState({
                    position: $rootScope.stackPosition
                }, "");
                $rootScope.stackPosition++;
            }
        }
    });
    $rootScope.setActive = function(path) {
        if (path === "" || path === "/") {} else {
            $rootScope.activePath = path;
        }
    };
    $rootScope.isSubActive = function(path) {
        return path === $rootScope.subActivePath;
    };
    $rootScope.setSubActive = function(path) {
        $rootScope.subActivePath = path;
        StorageService.set(StorageService.ACTIVE_SUB_TAB_KEY, path);
    };
    $rootScope.msg = function() {
        return msg;
    };
    $rootScope.loginMessage = function() {
        return loginMessage;
    };
    $rootScope.showSpinner = function() {
        return spinner;
    };
    $rootScope.createGuestIfNotExist = function() {
        User.createGuestIfNotExist().then(function(guest) {
            initUser(guest);
        }, function(error) {
            $rootScope.openCriticalErrorDlg("ERROR: Sorry, Failed to initialize the session. Please refresh the page and try again.");
        });
    };
    $rootScope.requests401 = [];
    $rootScope.$on("event:loginRequired", function() {
        $rootScope.showLoginDialog();
    });
    $rootScope.$on("event:loginRequiredWithRedirect", function(event, path) {
        $rootScope.showLoginDialog(path);
    });
    $rootScope.$on("event:loginConfirmed", function() {
        initUser(userInfoService.getCurrentUser());
        var i, requests = $rootScope.requests401, retry = function(req) {
            $http(req.config).then(function(response) {
                req.deferred.resolve(response);
            });
        };
        for (i = 0; i < requests.length; i += 1) {
            retry(requests[i]);
        }
        $rootScope.requests401 = [];
        $window.location.reload();
    });
    $rootScope.$on("event:loginRequest", function(event, username, password) {
        httpHeaders.common["Accept"] = "application/json";
        httpHeaders.common["Authorization"] = "Basic " + base64.encode(username + ":" + password);
        $http.get("api/accounts/login").then(function() {
            httpHeaders.common["Authorization"] = null;
            $http.get("api/accounts/cuser").then(function(result) {
                if (result.data && result.data != null) {
                    var rs = angular.fromJson(result.data);
                    userInfoService.setCurrentUser(rs);
                    $rootScope.$broadcast("event:loginConfirmed");
                } else {
                    userInfoService.setCurrentUser(null);
                }
            }, function() {
                userInfoService.setCurrentUser(null);
            });
        });
    });
    $rootScope.$on("event:loginRequestWithAuth", function(event, auth, path, loadApp) {
        httpHeaders.common["Accept"] = "application/json";
        httpHeaders.common["Authorization"] = "Basic " + auth;
        $http.get("api/accounts/login").success(function() {
            httpHeaders.common["Authorization"] = null;
            $http.get("api/accounts/cuser").then(function(result) {
                if (result.data && result.data != null) {
                    var rs = angular.fromJson(result.data);
                    initUser(rs);
                    if (path !== undefined) {
                        if (loadApp) {
                            $rootScope.appLoad();
                        }
                        $location.url(path);
                    } else {
                        if (loadApp) {
                            $rootScope.appLoad();
                        }
                        $rootScope.$broadcast("event:loginConfirmed");
                    }
                } else {
                    userInfoService.setCurrentUser(null);
                }
            }, function() {
                userInfoService.setCurrentUser(null);
            });
        });
    });
    $rootScope.$on("event:loginRedirectRequest", function(event, username, password, path) {
        httpHeaders.common["Accept"] = "application/json";
        httpHeaders.common["Authorization"] = "Basic " + base64.encode(username + ":" + password);
        $http.get("api/accounts/login").then(function() {
            httpHeaders.common["Authorization"] = null;
            $http.get("api/accounts/cuser").then(function(result) {
                if (result.data && result.data != null) {
                    var rs = angular.fromJson(result.data);
                    initUser(rs);
                    $rootScope.$broadcast("event:loginConfirmed");
                } else {
                    userInfoService.setCurrentUser(null);
                }
                $location.url(path);
            }, function() {
                userInfoService.setCurrentUser(null);
            });
        });
    });
    $rootScope.$on("event:logoutRequest", function() {
        httpHeaders.common["Authorization"] = null;
        userInfoService.setCurrentUser(null);
        $http.get("j_spring_security_logout").then(function(result) {
            $rootScope.createGuestIfNotExist();
            $rootScope.$broadcast("event:logoutConfirmed");
        });
    });
    $rootScope.$on("event:loginCancel", function() {
        httpHeaders.common["Authorization"] = null;
    });
    $rootScope.$on("$routeChangeStart", function(next, current) {
        if (msg && msg.manualHandle === "false") {
            msg.show = false;
        }
    });
    $rootScope.$watch(function() {
        return $rootScope.msg().text;
    }, function(value) {
        $rootScope.showNotification($rootScope.msg());
    });
    $rootScope.$watch("language()", function(value) {
        $rootScope.showNotification($rootScope.msg());
    });
    $rootScope.loadFromCookie = function() {
        if (userInfoService.hasCookieInfo() === true) {
            userInfoService.loadFromCookie();
            httpHeaders.common["Authorization"] = userInfoService.getHthd();
        } else {}
    };
    $rootScope.showNotification = function(m) {
        if (m != undefined && m.show && m.text != null) {
            var msg = angular.copy(m);
            var message = $.i18n.prop(msg.text);
            var type = msg.type;
            if (type === "danger") {
                Notification.error({
                    message: message,
                    templateUrl: "NotificationErrorTemplate.html",
                    scope: $rootScope,
                    delay: 1e4
                });
            } else if (type === "warning") {
                Notification.warning({
                    message: message,
                    templateUrl: "NotificationWarningTemplate.html",
                    scope: $rootScope,
                    delay: 5e3
                });
            } else if (type === "success") {
                Notification.success({
                    message: message,
                    templateUrl: "NotificationSuccessTemplate.html",
                    scope: $rootScope,
                    delay: 5e3
                });
            }
            m.text = null;
            m.type = null;
            m.show = false;
        }
    };
    $rootScope.getScrollbarWidth = function() {
        if ($rootScope.scrollbarWidth == 0) {
            var outer = document.createElement("div");
            outer.style.visibility = "hidden";
            outer.style.width = "100px";
            outer.style.msOverflowStyle = "scrollbar";
            document.body.appendChild(outer);
            var widthNoScroll = outer.offsetWidth;
            outer.style.overflow = "scroll";
            var inner = document.createElement("div");
            inner.style.width = "100%";
            outer.appendChild(inner);
            var widthWithScroll = inner.offsetWidth;
            outer.parentNode.removeChild(outer);
            $rootScope.scrollbarWidth = widthNoScroll - widthWithScroll;
        }
        return $rootScope.scrollbarWidth;
    };
    userInfoService.loadFromServer().then(function(currentUser) {
        if (currentUser !== null && currentUser.accountId != null && currentUser.accountId != undefined) {
            initUser(currentUser);
        } else {
            $rootScope.createGuestIfNotExist();
        }
    }, function(error) {
        $rootScope.createGuestIfNotExist();
    });
    $rootScope.getAppInfo = function() {
        return $rootScope.appInfo;
    };
    $rootScope.isDomainLoaded = function() {
        return StorageService.get(StorageService.APP_SELECTED_DOMAIN) !== null;
    };
    $rootScope.isAuthenticationRequired = function() {
        return $rootScope.getAppInfo() && $rootScope.getAppInfo().options && $rootScope.getAppInfo().options["AUTHENTICATION_REQUIRED"] === "true";
    };
    $rootScope.isEmployerRequired = function() {
        return $rootScope.getAppInfo() && $rootScope.getAppInfo().options && $rootScope.getAppInfo().options["EMPLOYER_REQUIRED"] === "true";
    };
    $rootScope.isCbManagementSupported = function() {
        return $rootScope.getAppInfo() && $rootScope.getAppInfo().options && $rootScope.getAppInfo().options["CB_MANAGEMENT_SUPPORTED"] === "true";
    };
    $rootScope.isCfManagementSupported = function() {
        return $rootScope.getAppInfo() && $rootScope.getAppInfo().options && $rootScope.getAppInfo().options["CF_MANAGEMENT_SUPPORTED"] === "true";
    };
    $rootScope.isDocumentationManagementSupported = function() {
        return $rootScope.getAppInfo() && $rootScope.getAppInfo().options && $rootScope.getAppInfo().options["DOC_MANAGEMENT_SUPPORTED"] === "true";
    };
    $rootScope.isDomainOwner = function(email) {
        return $rootScope.domain != null && $rootScope.domain.ownerEmails != null && $rootScope.domain.ownerEmails.length() > 0 && $rootScope.domain.ownerEmails.indexOf(email) != -1;
    };
    $rootScope.isDomainOwner = function() {
        return $rootScope.domain != null && $rootScope.domain.owner === userInfoService.getUsername();
    };
    $rootScope.isDomainsManagementSupported = function() {
        return $rootScope.getAppInfo() && $rootScope.getAppInfo().options && $rootScope.getAppInfo().options["DOMAIN_MANAGEMENT_SUPPORTED"] === "true" || userInfoService.isAdmin() || userInfoService.isSupervisor() || userInfoService.isDeployer();
    };
    $rootScope.isLoggedIn = function() {
        return userInfoService.isAuthenticated();
    };
    $rootScope.isDomainSelectionSupported = function() {
        return $rootScope.getAppInfo() && $rootScope.getAppInfo().options && $rootScope.getAppInfo().options["DOMAIN_SELECTION_SUPPORTED"] === "true";
    };
    $rootScope.isUserLoginSupported = function() {
        return $rootScope.getAppInfo() && $rootScope.getAppInfo().options && $rootScope.getAppInfo().options["USER_LOGIN_SUPPORTED"] === "true";
    };
    $rootScope.isReportSavingSupported = function() {
        return $rootScope.domain && $rootScope.domain.options && $rootScope.domain.options["REPORT_SAVING_SUPPORTED"] === "true";
    };
    $rootScope.isToolScopeSelectionDisplayed = function() {
        return $rootScope.getAppInfo() && $rootScope.getAppInfo().options && $rootScope.getAppInfo().options["TOOL_SCOPE_SELECTON_DISPLAYED"] === "true";
    };
    $rootScope.isUserLoginSupported = function() {
        return $rootScope.getAppInfo() && $rootScope.getAppInfo().options && $rootScope.getAppInfo().options["USER_LOGIN_SUPPORTED"] === "true";
    };
    $rootScope.isDevTool = function() {
        return $rootScope.getAppInfo() && $rootScope.getAppInfo().options && $rootScope.getAppInfo().options["IS_DEV_TOOL"] === "true";
    };
    $rootScope.getAppURL = function() {
        return $rootScope.appInfo.url;
    };
    $rootScope.$on("$routeChangeStart", function(event, next, current) {
        if (next && next["$$route"]) {
            var route = next["$$route"]["originalPath"];
            if (route === "/") {
                $rootScope.isWelcomePage = true;
                myService.initData(null);
            } else if (route.includes("/:domain")) {
                var domain = next.params.domain;
                if (domain === "onc") {
                    $rootScope.isWelcomePage = false;
                    if (StorageService.get(StorageService.APP_SELECTED_DOMAIN) !== "iz") {
                        myService.initData("iz");
                    }
                } else if (domain === "svap") {
                    $rootScope.isWelcomePage = false;
                    if (StorageService.get(StorageService.APP_SELECTED_DOMAIN) !== "iz-hti-1-svap") {
                        myService.initData("iz-hti-1-svap");
                    }
                } else {
                    $location.path("/");
                }
            }
        }
    });
});

angular.module("ui.bootstrap.carousel", [ "ui.bootstrap.transition" ]).controller("CarouselController", [ "$scope", "$timeout", "$transition", "$q", function($scope, $timeout, $transition, $q) {} ]).directive("carousel", [ function() {
    return {};
} ]);

angular.module("hit-tool-services").factory("TabSettings", [ "$rootScope", function($rootScope) {
    return {
        new: function(key) {
            return {
                key: key,
                activeTab: 0,
                getActiveTab: function() {
                    return this.activeTab;
                },
                setActiveTab: function(value) {
                    this.activeTab = value;
                    this.save();
                },
                save: function() {
                    sessionStorage.setItem(this.key, this.activeTab);
                },
                restore: function() {
                    this.activeTab = sessionStorage.getItem(this.key) != null && sessionStorage.getItem(this.key) != "" ? parseInt(sessionStorage.getItem(this.key)) : 0;
                }
            };
        }
    };
} ]);

app.controller("ErrorDetailsCtrl", function($scope, $modalInstance, error) {
    $scope.error = error;
    $scope.ok = function() {
        $modalInstance.close($scope.error);
    };
    $scope.cancel = function() {
        $modalInstance.dismiss("cancel");
    };
    $scope.refresh = function() {
        $modalInstance.close($window.location.reload());
    };
});

app.directive("stRatio", function() {
    return {
        link: function(scope, element, attr) {
            var ratio = +attr.stRatio;
            element.css("width", ratio + "%");
        }
    };
});

app.controller("TableFoundCtrl", function($scope, $modalInstance, table) {
    $scope.table = table;
    $scope.tmpTableElements = [].concat(table != null ? table.valueSetElements : []);
    $scope.cancel = function() {
        $modalInstance.dismiss("cancel");
    };
});

app.controller("ValidationResultInfoCtrl", [ "$scope", "$modalInstance", function($scope, $modalInstance) {
    $scope.close = function() {
        $modalInstance.dismiss("cancel");
    };
} ]);

app.filter("capitalize", function() {
    return function(input) {
        return !!input ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : "";
    };
});

app.filter("classification", function() {
    return function(input) {
        switch (input) {
          case "specerrors":
            return "spec errors";

          case "informationals":
            return "informationals";

          case "affirmatives":
            return "affirmatives";

          case "alerts":
            return "alerts";

          case "warnings":
            return "warnings";

          case "errors":
            return "errors";

          default:
            return input;
        }
    };
});

app.controller("ErrorCtrl", [ "$scope", "$modalInstance", "StorageService", "$window", function($scope, $modalInstance, StorageService, $window) {
    $scope.refresh = function() {
        $modalInstance.close($window.location.reload());
    };
} ]);

app.controller("FailureCtrl", [ "$scope", "$modalInstance", "StorageService", "$window", "error", function($scope, $modalInstance, StorageService, $window, error) {
    $scope.error = error;
    $scope.close = function() {
        $modalInstance.close();
    };
} ]);

app.service("base64", function base64() {
    var keyStr = "ABCDEFGHIJKLMNOP" + "QRSTUVWXYZabcdef" + "ghijklmnopqrstuv" + "wxyz0123456789+/" + "=";
    this.encode = function(input) {
        var output = "", chr1, chr2, chr3 = "", enc1, enc2, enc3, enc4 = "", i = 0;
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = (chr1 & 3) << 4 | chr2 >> 4;
            enc3 = (chr2 & 15) << 2 | chr3 >> 6;
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";
        }
        return output;
    };
    this.decode = function(input) {
        var output = "", chr1, chr2, chr3 = "", enc1, enc2, enc3, enc4 = "", i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = keyStr.indexOf(input.charAt(i++));
            enc2 = keyStr.indexOf(input.charAt(i++));
            enc3 = keyStr.indexOf(input.charAt(i++));
            enc4 = keyStr.indexOf(input.charAt(i++));
            chr1 = enc1 << 2 | enc2 >> 4;
            chr2 = (enc2 & 15) << 4 | enc3 >> 2;
            chr3 = (enc3 & 3) << 6 | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 !== 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 !== 64) {
                output = output + String.fromCharCode(chr3);
            }
            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";
        }
    };
});

app.factory("i18n", function() {
    var language;
    var setLanguage = function(theLanguage) {
        $.i18n.properties({
            name: "messages",
            path: "lang/",
            mode: "map",
            language: theLanguage,
            callback: function() {
                language = theLanguage;
            }
        });
    };
    setLanguage("en");
    return {
        setLanguage: setLanguage
    };
});

app.factory("Resource", [ "$resource", function($resource) {
    return function(url, params, methods) {
        var defaults = {
            update: {
                method: "put",
                isArray: false
            },
            create: {
                method: "post"
            }
        };
        methods = angular.extend(defaults, methods);
        var resource = $resource(url, params, methods);
        resource.prototype.$save = function(successHandler, errorHandler) {
            if (!this.id) {
                return this.$create(successHandler, errorHandler);
            } else {
                return this.$update(successHandler, errorHandler);
            }
        };
        return resource;
    };
} ]);

angular.module("commonServices").factory("StorageService", [ "$rootScope", "localStorageService", function($rootScope, localStorageService) {
    var service = {
        CF_EDITOR_CONTENT_KEY: "CF_EDITOR_CONTENT",
        CF_LOADED_TESTCASE_ID_KEY: "CF_LOADED_TESTCASE_ID",
        CF_LOADED_TESTCASE_TYPE_KEY: "CF_LOADED_TESTCASE_TYPE",
        CB_EDITOR_CONTENT_KEY: "CB_EDITOR_CONTENT",
        CB_SELECTED_TESTCASE_ID_KEY: "CB_SELECTED_TESTCASE_ID",
        CB_SELECTED_TESTCASE_TYPE_KEY: "CB_SELECTED_TESTCASE_TYPE",
        CB_LOADED_TESTCASE_ID_KEY: "CB_LOADED_TESTCASE_ID",
        CB_LOADED_TESTCASE_TYPE_KEY: "CB_LOADED_TESTCASE_TYPE",
        CB_LOADED_TESTSTEP_TYPE_KEY: "CB_LOADED_TESTSTEP_TYPE_KEY",
        CB_LOADED_TESTSTEP_ID_KEY: "CB_LOADED_TESTSTEP_ID",
        ISOLATED_EDITOR_CONTENT_KEY: "ISOLATED_EDITOR_CONTENT",
        ISOLATED_SELECTED_TESTCASE_ID_KEY: "ISOLATED_SELECTED_TESTCASE_ID",
        ISOLATED_LOADED_TESTCASE_ID_KEY: "ISOLATED_LOADED_TESTCASE_ID",
        ISOLATED_LOADED_TESTSTEP_ID_KEY: "ISOLATED_LOADED_TESTSTEP_ID",
        ISOLATED_LOADED_TESTSTEP_TYPE_KEY: "ISOLATED_LOADED_TESTSTEP_TYPE",
        ISOLATED_SELECTED_TESTCASE_TYPE_KEY: "ISOLATED_SELECTED_TESTCASE_TYPE",
        ISOLATED_LOADED_TESTCASE_TYPE_KEY: "ISOLATED_LOADED_TESTCASE_TYPE",
        SOAP_ENV_EDITOR_CONTENT_KEY: "SOAP_ENV_EDITOR_CONTENT",
        SOAP_ENV_SELECTED_TESTCASE_ID_KEY: "SOAP_ENV_SELECTED_TESTCASE_ID",
        SOAP_ENV_SELECTED_TESTCASE_TYPE_KEY: "SOAP_ENV_SELECTED_TESTCASE_TYPE",
        SOAP_ENV_LOADED_TESTCASE_ID_KEY: "SOAP_ENV_LOADED_TESTCASE_ID",
        SOAP_ENV_LOADED_TESTCASE_TYPE_KEY: "SOAP_ENV_LOADED_TESTCASE_TYPE",
        SOAP_CONN_REQ_EDITOR_CONTENT_KEY: "SOAP_CONN_REQ_EDITOR_CONTENT",
        SOAP_CONN_RESP_EDITOR_CONTENT_KEY: "SOAP_CONN_RESP_EDITOR_CONTENT",
        SOAP_CONN_SELECTED_TESTCASE_ID_KEY: "SOAP_CONN_SELECTED_TESTCASE_ID",
        SOAP_CONN_SELECTED_TESTCASE_TYPE_KEY: "SOAP_CONN_SELECTED_TESTCASE_TYPE",
        SOAP_CONN_LOADED_TESTCASE_ID_KEY: "SOAP_CONN_LOADED_TESTCASE_ID",
        SOAP_CONN_LOADED_TESTCASE_TYPE_KEY: "SOAP_CONN_LOADED_TESTCASE_TYPE",
        ACTIVE_SUB_TAB_KEY: "ACTIVE_SUB_TAB",
        DQA_OPTIONS_KEY: "DQA_OPTIONS_KEY",
        SETTINGS_KEY: "SETTINGS_KEY",
        USER_KEY: "USER_KEY",
        USER_CONFIG_KEY: "USER_CONFIG_KEY",
        TRANSPORT_CONFIG_KEY: "TRANSPORT_CONFIG_KEY",
        APP_STATE_TOKEN: "APP_STATE_TOKEN",
        TRANSPORT_DISABLED: "TRANSPORT_DISABLED",
        TRANSPORT_PROTOCOL: "TRANSPORT_PROTOCOL",
        CB_SELECTED_TESTPLAN_ID_KEY: "CB_SELECTED_TESTPLAN_ID",
        CB_SELECTED_TESTPLAN_TYPE_KEY: "CB_SELECTED_TESTPLAN_TYPE",
        CB_SELECTED_TESTPLAN_SCOPE_KEY: "CB_SELECTED_TESTPLAN_SCOPE_KEY",
        CF_SELECTED_TESTPLAN_SCOPE_KEY: "CF_SELECTED_TESTPLAN_SCOPE_KEY",
        CF_SELECTED_TESTPLAN_ID_KEY: "CF_SELECTED_TESTPLAN_ID",
        CF_SELECTED_TESTPLAN_TYPE_KEY: "CF_SELECTED_TESTPLAN_TYPE",
        TRANSPORT_TIMEOUT: "TRANSPORT_TIMEOUT",
        CF_ACTIVE_SUB_TAB_KEY: "ACTIVE_CF_SUB_TAB_KEY",
        CB_MANAGE_SELECTED_TESTCASE_ID_KEY: "CB_MANAGE_SELECTED_TESTCASE_ID",
        CB_MANAGE_SELECTED_TESTCASE_TYPE_KEY: "CB_MANAGE_SELECTED_TESTCASE_TYPE",
        CB_MANAGE_LOADED_TESTCASE_ID_KEY: "CB_MANAGE_LOADED_TESTCASE_ID",
        CB_MANAGE_LOADED_TESTCASE_TYPE_KEY: "CB_MANAGE_LOADED_TESTCASE_TYPE",
        CB_MANAGE_LOADED_TESTSTEP_TYPE_KEY: "CB_MANAGE_LOADED_TESTSTEP_TYPE_KEY",
        CB_MANAGE_LOADED_TESTSTEP_ID_KEY: "CB_MANAGE_LOADED_TESTSTEP_ID",
        CB_MANAGE_SELECTED_TESTPLAN_ID_KEY: "CB_MANAGE_SELECTED_TESTPLAN_ID",
        CB_MANAGE_SELECTED_TESTPLAN_TYPE_KEY: "CB_MANAGE_SELECTED_TESTPLAN_TYPE",
        CB_MANAGE_SELECTED_TESTPLAN_SCOPE_KEY: "CB_MANAGE_SELECTED_TESTPLAN_SCOPE_KEY",
        DOC_MANAGE_SELECTED_SCOPE_KEY: "DOC_MANAGE_SELECTED_SCOPE_KEY",
        APP_SELECTED_DOMAIN: "APP_SELECTED_DOMAIN",
        DOMAIN_MANAGE_SELECTED_SCOPE_KEY: "DOMAIN_MANAGE_SELECTED_SCOPE_KEY",
        DOMAIN_MANAGE_SELECTED_ID: "DOMAIN_MANAGE_SELECTED_ID",
        CF_MANAGE_SELECTED_TESTPLAN_ID_KEY: "CF_MANAGE_SELECTED_TESTPLAN_ID_KEY",
        remove: function(key) {
            return localStorageService.remove(key);
        },
        removeList: function removeItems(key1, key2, key3) {
            return localStorageService.remove(key1, key2, key3);
        },
        clearAll: function() {
            return localStorageService.clearAll();
        },
        set: function(key, val) {
            return localStorageService.set(key, val);
        },
        get: function(key) {
            return localStorageService.get(key);
        },
        getTransportConfig: function(domain, protocol) {
            return localStorageService.get(domain + "-" + protocol + "-transport-configs");
        },
        setTransportConfig: function(domain, protocol, val) {
            return localStorageService.set(domain + "-" + protocol + "-transport-configs", val);
        }
    };
    return service;
} ]);

angular.module("commonServices").factory("Er7Message", function($http, $q, Message) {
    var Er7Message = function() {
        Message.apply(this, arguments);
    };
    Er7Message.prototype = Object.create(Message.prototype);
    Er7Message.prototype.constructor = Er7Message;
    return Er7Message;
});

angular.module("format").factory("IZReportClass", function($http, $q) {
    var IZReportClass = function() {
        this.html = null;
    };
    IZReportClass.prototype.generate = function(content) {
        var delay = $q.defer();
        var that = this;
        $http({
            url: "api/iz/report/generate",
            data: $.param({
                content: content
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            method: "POST",
            timeout: 6e4
        }).then(function(data) {
            var res = angular.fromJson(data);
            that.html = res["htmlReport"];
            delay.resolve(that.html);
        }, function(err) {
            that.html = null;
            delay.reject(err);
        });
        return delay.promise;
    };
    IZReportClass.prototype.download = function(format, title, content) {
        var form = document.createElement("form");
        form.action = "api/iz/report/download";
        form.method = "POST";
        form.target = "_target";
        var input = document.createElement("textarea");
        input.name = "content";
        input.value = content;
        form.appendChild(input);
        input = document.createElement("input");
        input.name = "format";
        input.value = format;
        form.appendChild(input);
        input = document.createElement("input");
        input.name = "title";
        input.value = title;
        form.appendChild(input);
        form.style.display = "none";
        document.body.appendChild(form);
        form.submit();
    };
    return IZReportClass;
});

angular.module("transport").factory("Transport", function($q, $http, StorageService, User, $timeout, $rootScope) {
    var Transport = {
        running: false,
        configs: {},
        transactions: [],
        logs: {},
        timeout: StorageService.get(StorageService.TRANSPORT_TIMEOUT) != null && StorageService.get(StorageService.TRANSPORT_TIMEOUT) != undefined ? StorageService.get(StorageService.TRANSPORT_TIMEOUT) : 120,
        disabled: StorageService.get(StorageService.TRANSPORT_DISABLED) != null ? StorageService.get(StorageService.TRANSPORT_DISABLED) : true,
        setDisabled: function(disabled) {
            this.disabled = disabled;
        },
        setTimeout: function(timeout) {
            this.timeout = timeout;
            StorageService.set(StorageService.TRANSPORT_TIMEOUT, timeout);
        },
        getTimeout: function() {
            return this.timeout;
        },
        getDomainForms: function(domain) {
            var delay = $q.defer();
            $http.get("api/transport/forms/" + domain).then(function(response) {
                var data = angular.fromJson(response.data);
                delay.resolve(data);
            }, function(response) {
                delay.reject(response);
            });
            return delay.promise;
        },
        getConfigData: function(domain, protocol) {
            var delay = $q.defer();
            var self = this;
            if (domain != null && protocol != null && User.info && User.info != null && User.info.id != null) {
                $http.post("api/transport/" + domain + "/" + protocol + "/configs").then(function(response) {
                    delay.resolve(angular.fromJson(response.data));
                }, function(response) {
                    delay.reject(response);
                });
            } else {
                delay.reject("Domain, protocol or user info not provided");
            }
            return delay.promise;
        },
        searchTransaction: function(testStepId, config, responseMessageId, domain, protocol) {
            var delay = $q.defer();
            var self = this;
            if (config != null) {
                var data = angular.fromJson({
                    testStepId: testStepId,
                    userId: User.info.id,
                    config: config,
                    responseMessageId: responseMessageId
                });
                $http.post("api/transport/" + domain + "/" + protocol + "/searchTransaction", data).then(function(response) {
                    if (response.data != null && response.data != "") {
                        self.transactions[testStepId] = angular.fromJson(response.data);
                    } else {
                        self.transactions[testStepId] = null;
                    }
                    delay.resolve(self.transactions[testStepId]);
                }, function(response) {
                    self.transactions[testStepId] = null;
                    delay.reject(self.transactions[testStepId]);
                });
            } else {
                delay.reject("Configuration info not found");
            }
            return delay.promise;
        },
        deleteTransaction: function(testStepId) {
            var delay = $q.defer();
            var self = this;
            if (self.transactions && self.transactions != null && self.transactions[testStepId]) {
                var transaction = self.transactions[testStepId];
                $http.post("api/transport/transaction/" + transaction.id + "/delete").then(function(response) {
                    delete self.transactions[testStepId];
                    delay.resolve(true);
                }, function(response) {
                    delete self.transactions[testStepId];
                    delay.resolve(true);
                });
            } else {
                delay.resolve(true);
            }
            return delay.promise;
        },
        stopListener: function(testStepId, domain, protocol) {
            var self = this;
            var delay = $q.defer();
            this.deleteTransaction(testStepId).then(function(result) {
                var data = angular.fromJson({
                    testStepId: testStepId
                });
                $http.post("api/transport/" + domain + "/" + protocol + "/stopListener", data).then(function(response) {
                    self.running = true;
                    delay.resolve(true);
                }, function(response) {
                    self.running = false;
                    delay.reject(null);
                });
            });
            return delay.promise;
        },
        startListener: function(testStepId, responseMessageId, domain, protocol) {
            var delay = $q.defer();
            var self = this;
            this.deleteTransaction(testStepId).then(function(result) {
                var data = angular.fromJson({
                    testStepId: testStepId,
                    responseMessageId: responseMessageId
                });
                $http.post("api/transport/" + domain + "/" + protocol + "/startListener", data).then(function(response) {
                    self.running = true;
                    delay.resolve(true);
                }, function(response) {
                    self.running = false;
                    delay.reject(null);
                });
            });
            return delay.promise;
        },
        send: function(testStepId, message, domain, protocol) {
            var delay = $q.defer();
            var self = this;
            this.deleteTransaction(testStepId).then(function(result) {
                var data = angular.fromJson({
                    testStepId: testStepId,
                    message: message,
                    config: self.configs[protocol].data.taInitiator
                });
                $http.post("api/transport/" + domain + "/" + protocol + "/send", data).then(function(response) {
                    self.transactions[testStepId] = angular.fromJson(response.data);
                    delay.resolve(self.transactions[testStepId]);
                }, function(response) {
                    self.transactions[testStepId] = null;
                    delay.reject(response);
                });
            });
            return delay.promise;
        },
        populateMessage: function(testStepId, message, domain, protocol) {
            var delay = $q.defer();
            var self = this;
            var data = angular.fromJson({
                testStepId: testStepId,
                message: message
            });
            $http.post("api/transport/" + domain + "/" + protocol + "/populateMessage", data).then(function(response) {
                delay.resolve(angular.fromJson(response.data));
            }, function(response) {
                delay.reject(null);
            });
            return delay.promise;
        },
        saveTransportLog: function(testStepId, content, domain, protocol) {
            var delay = $q.defer();
            var data = angular.fromJson({
                testStepId: testStepId,
                content: content,
                domain: domain,
                protocol: protocol
            });
            $http.post("api/logs/transport", data).then(function(response) {
                delay.resolve(response.data);
            }, function(response) {
                delay.reject(null);
            });
            return delay.promise;
        }
    };
    return Transport;
});

"use strict";

angular.module("main").controller("MainService", function($scope) {});

angular.module("main").factory("TestingSettings", [ "$rootScope", function($rootScope) {
    var service = {
        activeTab: 0,
        getActiveTab: function() {
            return service.activeTab;
        },
        setActiveTab: function(value) {
            service.activeTab = value;
            service.save();
        },
        save: function() {
            sessionStorage.TestingActiveTab = service.activeTab;
        },
        restore: function() {
            service.activeTab = sessionStorage.TestingActiveTab != null && sessionStorage.TestingActiveTab != "" ? parseInt(sessionStorage.TestingActiveTab) : 0;
        }
    };
    return service;
} ]);

angular.module("main").service("modalService", [ "$modal", function($modal) {
    var modalDefaults = {
        backdrop: true,
        keyboard: true,
        modalFade: true,
        templateUrl: "views/modal.html"
    };
    var modalOptions = {
        closeButtonText: "Close",
        actionButtonText: "OK",
        headerText: "Proceed?",
        bodyText: "Perform this action?"
    };
    this.showModal = function(customModalDefaults, customModalOptions) {
        if (!customModalDefaults) customModalDefaults = {};
        customModalDefaults.backdrop = "static";
        return this.show(customModalDefaults, customModalOptions);
    };
    this.show = function(customModalDefaults, customModalOptions) {
        var tempModalDefaults = {};
        var tempModalOptions = {};
        angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);
        angular.extend(tempModalOptions, modalOptions, customModalOptions);
        if (!tempModalDefaults.controller) {
            tempModalDefaults.controller = [ "$scope", "$modalInstance", function($scope, $modalInstance) {
                $scope.modalOptions = tempModalOptions;
                $scope.modalOptions.ok = function(result) {
                    $modalInstance.close(result);
                };
                $scope.modalOptions.close = function(result) {
                    $modalInstance.dismiss("cancel");
                };
            } ];
        }
        return $modal.open(tempModalDefaults).result;
    };
} ]);

"use strict";

angular.module("account").factory("Account", [ "$resource", function($resource) {
    return $resource("api/accounts/:id", {
        id: "@id"
    });
} ]);

angular.module("account").factory("LoginService", [ "$resource", "$q", function($resource, $q) {
    return function() {
        var myRes = $resource("api/accounts/login");
        var delay = $q.defer();
        myRes.get({}, function(res) {
            delay.resolve(res);
        });
        return delay.promise;
    };
} ]);

angular.module("account").factory("AccountLoader", [ "Account", "$q", function(Account, $q) {
    return function(acctID) {
        var delay = $q.defer();
        Account.get({
            id: acctID
        }, function(account) {
            delay.resolve(account);
        }, function() {
            delay.reject("Unable to fetch account");
        });
        return delay.promise;
    };
} ]);

"use strict";

angular.module("account").factory("Testers", [ "$resource", function($resource) {
    return $resource("api/shortaccounts", {
        filter: [ "accountType::tester", "accountType::deployer", "accountType::admin" ]
    });
} ]);

angular.module("account").factory("Supervisors", [ "$resource", function($resource) {
    return $resource("api/shortaccounts", {
        filter: "accountType::supervisor"
    });
} ]);

angular.module("account").factory("MultiTestersLoader", [ "Testers", "$q", function(Testers, $q) {
    return function() {
        var delay = $q.defer();
        Testers.query(function(auth) {
            delay.resolve(auth);
        }, function() {
            delay.reject("Unable to fetch list of testers");
        });
        return delay.promise;
    };
} ]);

angular.module("account").factory("MultiSupervisorsLoader", [ "Supervisors", "$q", function(Supervisors, $q) {
    return function() {
        var delay = $q.defer();
        Supervisors.query(function(res) {
            delay.resolve(res);
        }, function() {
            delay.reject("Unable to fetch list of supervisors");
        });
        return delay.promise;
    };
} ]);

angular.module("account").factory("userLoaderService", [ "userInfo", "$q", function(userInfo, $q) {
    var load = function() {
        var delay = $q.defer();
        userInfo.get({}, function(theUserInfo) {
            delay.resolve(theUserInfo);
        }, function() {
            delay.reject("Unable to fetch user info");
        });
        return delay.promise;
    };
    return {
        load: load
    };
} ]);

"use strict";

angular.module("account").factory("userInfo", [ "$resource", function($resource) {
    return $resource("api/accounts/cuser");
} ]);

angular.module("account").factory("userLoaderService", [ "userInfo", "$q", function(userInfo, $q) {
    var load = function() {
        var delay = $q.defer();
        userInfo.get({}, function(theUserInfo) {
            delay.resolve(theUserInfo);
        }, function() {
            delay.reject("Unable to fetch user info");
        });
        return delay.promise;
    };
    return {
        load: load
    };
} ]);

angular.module("account").factory("userInfoService", [ "StorageService", "userLoaderService", "User", "Transport", "$q", "$timeout", "$rootScope", function(StorageService, userLoaderService, User, Transport, $q, $timeout, $rootScope) {
    var currentUser = null;
    var supervisor = false, tester = false, publisher = false, deployer = false, admin = false, id = null, username = "", fullName = "", lastTestPlanPersistenceId = null, employer = null;
    var loadFromCookie = function() {
        id = StorageService.get("userID");
        username = StorageService.get("username");
        tester = StorageService.get("tester");
        supervisor = StorageService.get("supervisor");
        deployer = StorageService.get("deployer");
        publisher = StorageService.get("publisher");
        admin = StorageService.get("admin");
        lastTestPlanPersistenceId = StorageService.get("lastTestPlanPersistenceId");
        employer = StorageService.get("employer");
    };
    var saveToCookie = function() {
        StorageService.set("accountID", id);
        StorageService.set("username", username);
        StorageService.set("tester", tester);
        StorageService.set("supervisor", supervisor);
        StorageService.set("deployer", deployer);
        StorageService.set("publisher", publisher);
        StorageService.set("admin", admin);
        StorageService.set("fullName", fullName);
        StorageService.set("lastTestPlanPersistenceId", lastTestPlanPersistenceId);
        StorageService.set("employer", employer);
    };
    var clearCookie = function() {
        StorageService.remove("accountID");
        StorageService.remove("username");
        StorageService.remove("tester");
        StorageService.remove("supervisor");
        StorageService.remove("publisher");
        StorageService.remove("deployer");
        StorageService.remove("admin");
        StorageService.remove("hthd");
        StorageService.remove("fullName");
        StorageService.remove("lastTestPlanPersistenceId");
        StorageService.remove("employer");
    };
    var saveHthd = function(header) {
        StorageService.set("hthd", header);
    };
    var getHthd = function(header) {
        return StorageService.get("hthd");
    };
    var hasCookieInfo = function() {
        if (StorageService.get("username") === "") {
            return false;
        } else {
            return true;
        }
    };
    var getAccountID = function() {
        if (isAuthenticated()) {
            return currentUser.accountId.toString();
        }
        return "0";
    };
    var isAdmin = function() {
        if (!admin && currentUser != null && $rootScope.appInfo && $rootScope.appInfo.adminEmails != null && $rootScope.appInfo.adminEmails) {
            if (Array.isArray($rootScope.appInfo.adminEmails)) {
                admin = $rootScope.appInfo.adminEmails.indexOf(currentUser.email) >= 0;
            } else {
                admin = $rootScope.appInfo.adminEmails === currentUser.email;
            }
        }
        return admin;
    };
    var isTester = function() {
        return tester;
    };
    var isSupervisor = function() {
        return supervisor;
    };
    var isDeployer = function() {
        return deployer;
    };
    var isPublisher = function() {
        return publisher;
    };
    var isPending = function() {
        return isAuthenticated() && currentUser != null ? currentUser.pending : false;
    };
    var isAuthenticated = function() {
        var res = currentUser !== undefined && currentUser != null && currentUser.authenticated === true;
        return res;
    };
    var loadFromServer = function() {
        if (!isAuthenticated()) {
            return userLoaderService.load();
        } else {
            var delay = $q.defer();
            $timeout(function() {
                delay.resolve(currentUser);
            });
            return delay.promise;
        }
    };
    var getCurrentUser = function() {
        return currentUser;
    };
    var setCurrentUser = function(newUser) {
        currentUser = newUser;
        if (currentUser !== null && currentUser !== undefined) {
            username = currentUser.username;
            id = currentUser.accountId;
            fullName = currentUser.fullName;
            lastTestPlanPersistenceId = currentUser.lastTestPlanPersistenceId;
            employer = currentUser.employer;
            if (angular.isArray(currentUser.authorities)) {
                angular.forEach(currentUser.authorities, function(value, key) {
                    switch (value.authority) {
                      case "user":
                        break;

                      case "admin":
                        admin = true;
                        break;

                      case "tester":
                        tester = true;
                        break;

                      case "supervisor":
                        supervisor = true;
                        break;

                      case "deployer":
                        deployer = true;
                        break;

                      case "publisher":
                        publisher = true;
                        break;

                      default:                    }
                });
            }
        } else {
            supervisor = false;
            tester = false;
            deployer = false;
            publisher = false;
            admin = false;
            username = "";
            id = null;
            fullName = "";
            lastTestPlanPersistenceId = null;
            employer = "";
        }
    };
    var getUsername = function() {
        return username;
    };
    var getFullName = function() {
        return fullName;
    };
    var getLastTestPlanPersistenceId = function() {
        return lastTestPlanPersistenceId;
    };
    var getEmployer = function() {
        return employer;
    };
    return {
        saveHthd: saveHthd,
        getHthd: getHthd,
        hasCookieInfo: hasCookieInfo,
        loadFromCookie: loadFromCookie,
        getAccountID: getAccountID,
        isAdmin: isAdmin,
        isPublisher: isPublisher,
        isTester: isTester,
        isAuthenticated: isAuthenticated,
        isPending: isPending,
        isSupervisor: isSupervisor,
        isDeployer: isDeployer,
        setCurrentUser: setCurrentUser,
        getCurrentUser: getCurrentUser,
        loadFromServer: loadFromServer,
        getUsername: getUsername,
        getFullName: getFullName,
        getLastTestPlanPersistenceId: getLastTestPlanPersistenceId,
        getEmployer: getEmployer
    };
} ]);

angular.module("envelope").factory("Envelope", [ "SOAPEditor", "SOAPCursor", "ValidationResult", "IZReportClass", "Message", "ValidationSettings", function(SOAPEditor, SOAPCursor, ValidationResult, IZReportClass, Message, ValidationSettings) {
    var Envelope = {
        testCase: null,
        selectedTestCase: null,
        editor: new SOAPEditor(),
        cursor: new SOAPCursor(),
        validationResult: new ValidationResult(),
        message: new Message(),
        report: new IZReportClass(),
        validationSettings: new ValidationSettings(),
        getContent: function() {
            return Envelope.message.content;
        }
    };
    return Envelope;
} ]);

angular.module("envelope").factory("EnvelopeTestCaseListLoader", [ "$q", "$http", function($q, $http) {
    return function() {
        var delay = $q.defer();
        $http.get("api/envelope/testcases/", {
            timeout: 6e4
        }).then(function(object) {
            delay.resolve(angular.fromJson(object.data));
        }, function(response) {
            delay.reject(response.data);
        });
        return delay.promise;
    };
} ]);

angular.module("envelope").factory("EnvelopeValidator", function($http, $q, SOAPEditorUtils) {
    var EnvelopeValidator = function() {};
    EnvelopeValidator.prototype.validate = function(message, testCaseId) {
        var delay = $q.defer();
        if (!SOAPEditorUtils.isXML(message)) {
            delay.reject("Message provided is not an xml message");
        } else {
            var data = angular.fromJson({
                content: message
            });
            $http.post("api/envelope/testcases/" + testCaseId + "/validate", data, {
                timeout: 6e4
            }).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
        }
        return delay.promise;
    };
    return EnvelopeValidator;
});

"use strict";

angular.module("cf").factory("CF", [ "$rootScope", "$http", "$q", "Message", "Tree", function($rootScope, $http, $q, Message, Tree) {
    var CF = {
        editor: null,
        cursor: null,
        tree: new Tree(),
        testCase: null,
        selectedTestCase: null,
        message: new Message(),
        searchTableId: 0
    };
    return CF;
} ]);

angular.module("cf").factory("CFTestPlanExecutioner", [ "$q", "$http", function($q, $http) {
    var manager = {
        getTestPlan: function(id) {
            var delay = $q.defer();
            $http.get("api/cf/testplans/" + id, {
                timeout: 18e4
            }).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        getTestPlans: function(scope, domain) {
            var delay = $q.defer();
            $http.get("api/cf/testplans", {
                timeout: 18e4,
                params: {
                    scope: scope,
                    domain: domain
                }
            }).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        }
    };
    return manager;
} ]);

angular.module("cf").factory("CFTestPlanManager", [ "$q", "$http", function($q, $http) {
    var manager = {
        getTestStepGroupProfiles: function(groupId) {
            var delay = $q.defer();
            $http.get("api/cf/management/testStepGroups/" + groupId + "/profiles", {
                timeout: 18e4
            }).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        getTestPlanProfiles: function(groupId) {
            var delay = $q.defer();
            $http.get("api/cf/management/testPlans/" + groupId + "/profiles", {
                timeout: 18e4
            }).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        getTokenProfiles: function(format, token) {
            var delay = $q.defer();
            $http.get("api/cf/" + format + "/management/tokens/" + token + "/profiles", {
                timeout: 18e4
            }).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        getTestPlan: function(id) {
            var delay = $q.defer();
            $http.get("api/cf/management/testPlans/" + id, {
                timeout: 18e4
            }).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        getTestPlans: function(scope, domain) {
            var delay = $q.defer();
            $http.get("api/cf/management/testPlans", {
                timeout: 18e4,
                params: {
                    scope: scope,
                    domain: domain
                }
            }).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        addChild: function(newGroup, parent) {
            var delay = $q.defer();
            var params = $.param({
                position: newGroup.position,
                name: newGroup.name,
                description: newGroup.description,
                scope: newGroup.scope,
                domain: newGroup.domain
            });
            var config = {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded;charset=utf-8;"
                }
            };
            var url = null;
            if (parent.type == "TestPlan") {
                url = "api/cf/management/testPlans/" + parent.id + "/addChild";
            } else {
                url = "api/cf/management/testStepGroups/" + parent.id + "/addChild";
            }
            $http.post(url, params, config).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        createTestPlan: function(testPlan) {
            var delay = $q.defer();
            var params = $.param({
                name: testPlan.name,
                description: testPlan.description,
                position: testPlan.position,
                domain: testPlan.domain,
                scope: testPlan.scope
            });
            var config = {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded;charset=utf-8;"
                }
            };
            $http.post("api/cf/management/testPlans/create", params, config).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        deleteProfile: function(domain, profileId) {
            var delay = $q.defer();
            $http.post("api/cf/" + domain + "/management/profiles/" + profileId + "/delete").then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        deleteTestStepGroup: function(testStepGroup) {
            var delay = $q.defer();
            var context = testStepGroup.parent.type === "TestPlan" ? "testPlans/" : "testStepGroups/";
            $http.post("api/cf/management/" + context + testStepGroup.parent.id + "/testStepGroups/" + testStepGroup.id + "/delete").then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        deleteTestPlan: function(testPlan) {
            var delay = $q.defer();
            $http.post("api/cf/management/testPlans/" + testPlan.id + "/delete").then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        updateLocation: function(destination, child, newPosition) {
            var params = $.param({
                newPosition: newPosition,
                oldParentId: child.parent.id,
                oldParentType: child.parent.type,
                newParentId: destination.id,
                newParentType: destination.type
            });
            var config = {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded;charset=utf-8;"
                }
            };
            var delay = $q.defer();
            $http.post("api/cf/management/testStepGroups/" + child.id + "/location", params, config).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        deleteToken: function(tok) {
            var delay = $q.defer();
            $http.post("api/cf/management/tokens/" + tok + "/delete").then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(error) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        saveTestStepGroup: function(format, scope, token, updated, removed, added, metadata) {
            var delay = $q.defer();
            $http.post("api/cf/" + format + "/management/testStepGroups/" + metadata.groupId, {
                groupId: metadata.groupId,
                testcasename: metadata.name,
                testcasedescription: metadata.description,
                added: added,
                removed: removed,
                updated: updated,
                token: token,
                scope: scope
            }).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        saveTestPlan: function(format, scope, token, updated, removed, added, metadata) {
            var delay = $q.defer();
            $http.post("api/cf/" + format + "/management/testPlans/" + metadata.groupId, {
                groupId: metadata.groupId,
                testcasename: metadata.name,
                testcasedescription: metadata.description,
                added: added,
                removed: removed,
                updated: updated,
                token: token,
                scope: scope
            }).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        publishTestPlan: function(groupId) {
            var delay = $q.defer();
            $http.post("api/cf/management/testPlans/" + groupId + "/publish").then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        }
    };
    return manager;
} ]);

angular.module("cf").service("modalService", [ "$modal", function($modal) {
    var modalDefaults = {
        backdrop: true,
        keyboard: true,
        modalFade: true,
        templateUrl: "views/cf/modal.html"
    };
    var modalOptions = {
        closeButtonText: "Close",
        actionButtonText: "OK",
        headerText: "Proceed?",
        bodyText: "Perform this action?"
    };
    this.showModal = function(customModalDefaults, customModalOptions) {
        if (!customModalDefaults) customModalDefaults = {};
        customModalDefaults.backdrop = "static";
        return this.show(customModalDefaults, customModalOptions);
    };
    this.show = function(customModalDefaults, customModalOptions) {
        var tempModalDefaults = {};
        var tempModalOptions = {};
        angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);
        angular.extend(tempModalOptions, modalOptions, customModalOptions);
        if (!tempModalDefaults.controller) {
            tempModalDefaults.controller = [ "$scope", "$modalInstance", function($scope, $modalInstance) {
                $scope.modalOptions = tempModalOptions;
                $scope.modalOptions.ok = function(result) {
                    $modalInstance.close(result);
                };
                $scope.modalOptions.close = function(result) {
                    $modalInstance.dismiss("cancel");
                };
            } ];
        }
        return $modal.open(tempModalDefaults).result;
    };
} ]);

"use strict";

angular.module("cb").factory("CB", [ "Message", "ValidationSettings", "Tree", "StorageService", "Transport", "Logger", "User", function(Message, ValidationSettings, Tree, StorageService, Transport, Logger, User) {
    var CB = {
        testCase: null,
        selectedTestCase: null,
        selectedTestPlan: null,
        editor: null,
        tree: new Tree(),
        cursor: null,
        message: new Message(),
        logger: new Logger(),
        validationSettings: new ValidationSettings(),
        setContent: function(value) {
            CB.message.content = value;
            CB.editor.instance.doc.setValue(value);
            CB.message.notifyChange();
        },
        getContent: function() {
            return CB.message.content;
        }
    };
    return CB;
} ]);

angular.module("cb").factory("CBTestPlanListLoader", [ "$q", "$http", function($q, $http) {
    return function(scope, domain) {
        var delay = $q.defer();
        $http.get("api/cb/testplans", {
            timeout: 18e4,
            params: {
                scope: scope,
                domain: domain
            }
        }).then(function(object) {
            delay.resolve(angular.fromJson(object.data));
        }, function(response) {
            delay.reject(response.data);
        });
        return delay.promise;
    };
} ]);

angular.module("cb").factory("CBTestPlanLoader", [ "$q", "$http", function($q, $http) {
    return function(id) {
        var delay = $q.defer();
        $http.get("api/cb/testplans/" + id, {
            timeout: 18e4
        }).then(function(object) {
            delay.resolve(angular.fromJson(object.data));
        }, function(response) {
            delay.reject(response.data);
        });
        return delay.promise;
    };
} ]);

angular.module("cb").factory("CBTestPlanManager", [ "$q", "$http", function($q, $http) {
    var manager = {
        getTestPlan: function(testPlanId) {
            var delay = $q.defer();
            $http.get("api/cb/management/testPlans/" + testPlanId, {
                timeout: 18e4
            }).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        getTestPlans: function(scope, domain) {
            var delay = $q.defer();
            $http.get("api/cb/management/testPlans", {
                timeout: 18e4,
                params: {
                    scope: scope,
                    domain: domain
                }
            }).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        publishTestPlan: function(testPlanId) {
            var delay = $q.defer();
            $http.post("api/cb/management/testPlans/" + testPlanId + "/publish").then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        deleteTestStep: function(testStep) {
            var delay = $q.defer();
            $http.post("api/cb/management/testCases/" + testStep.parent.id + "/testSteps/" + testStep.id + "/delete").then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        deleteTestCase: function(testCase) {
            var delay = $q.defer();
            var context = testCase.parent.type === "TestPlan" ? "testPlans/" : "testCaseGroups/";
            $http.post("api/cb/management/" + context + testCase.parent.id + "/testCases/" + testCase.id + "/delete").then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        deleteTestPlan: function(testPlan) {
            var delay = $q.defer();
            $http.post("api/cb/management/testPlans/" + testPlan.id + "/delete").then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        deleteTestCaseGroup: function(testCaseGroup) {
            var delay = $q.defer();
            var context = testCaseGroup.parent.type === "TestPlan" ? "testPlans/" : "testCaseGroups/";
            $http.post("api/cb/management/" + context + testCaseGroup.parent.id + "/testCaseGroups/" + testCaseGroup.id + "/delete").then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        updateTestCaseGroupName: function(node) {
            var delay = $q.defer();
            $http.post("api/cb/management/testCaseGroups/" + node.id + "/name", node.editName).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        updateTestCaseName: function(node) {
            var delay = $q.defer();
            $http.post("api/cb/management/testCases/" + node.id + "/name", node.editName).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        updateTestStepName: function(node) {
            var delay = $q.defer();
            $http.post("api/cb/management/testSteps/" + node.id + "/name", node.editName).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        updateTestPlanName: function(node) {
            var delay = $q.defer();
            $http.post("api/cb/management/testPlans/" + node.id + "/name", node.editName).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        saveZip: function(token, domain) {
            var delay = $q.defer();
            $http.post("api/cb/management/saveZip/", {
                token: token,
                domain: domain
            }).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        unpublishTestPlan: function(testPlanId) {
            var delay = $q.defer();
            $http.post("api/cb/management/testPlans/" + testPlanId + "/unpublish").then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        }
    };
    return manager;
} ]);

"use strict";

angular.module("connectivity").factory("Connectivity", [ "$rootScope", "$http", "$q", "ConnectivityPart", "Logger", "Endpoint", "SOAPConnectivityTransport", "StorageService", function($rootScope, $http, $q, ConnectivityPart, Logger, Endpoint, SOAPConnectivityTransport, StorageService) {
    var Connectivity = {
        testCase: null,
        selectedTestCase: null,
        logger: new Logger(),
        request: new ConnectivityPart(),
        response: new ConnectivityPart()
    };
    return Connectivity;
} ]);

angular.module("connectivity").factory("ConnectivityTestCaseListLoader", [ "$q", "$http", function($q, $http) {
    return function() {
        var delay = $q.defer();
        $http.get("api/connectivity/testcases").then(function(response) {
            delay.resolve(angular.fromJson(response.data));
        }, function(response) {
            delay.reject("Sorry, failed to fetch the test cases. Please refresh your page.");
        });
        return delay.promise;
    };
} ]);

angular.module("connectivity").factory("ConnectivityValidator", [ "$q", "$http", "SOAPEditorUtils", function($q, $http, SOAPEditorUtils) {
    var ConnectivityValidator = function() {};
    ConnectivityValidator.prototype.validate = function(content, testCaseId, type, reqMessage) {
        var delay = $q.defer();
        if (!SOAPEditorUtils.isXML(content)) {
            delay.reject("Message provided is not an xml message");
        } else {
            var data = angular.fromJson({
                content: content,
                testCaseId: testCaseId,
                type: type,
                requestMessage: reqMessage
            });
            $http.post("api/connectivity/validate", data, {
                timeout: 6e4
            }).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
        }
        return delay.promise;
    };
    return ConnectivityValidator;
} ]);

angular.module("connectivity").factory("ConnectivityPart", [ "$rootScope", "$http", "$q", "SOAPEditor", "SOAPCursor", "ValidationResult", "IZReportClass", "Message", "ValidationSettings", function($rootScope, $http, $q, SOAPEditor, SOAPCursor, ValidationResult, IZReportClass, Message, ValidationSettings) {
    var ConnectivityPart = function() {
        this.editor = new SOAPEditor();
        this.cursor = new SOAPCursor();
        this.validationResult = new ValidationResult();
        this.message = new Message();
        this.report = new IZReportClass();
        this.validationSettings = new ValidationSettings();
    };
    ConnectivityPart.prototype.setContent = function(value) {
        this.editor.instance.doc.setValue(value);
    };
    ConnectivityPart.prototype.formatContent = function() {
        this.editor.format();
    };
    ConnectivityPart.prototype.getContent = function() {
        return this.message.content;
    };
    return ConnectivityPart;
} ]);

angular.module("commonServices").factory("SOAPConnectivityTransport", function($q, $http, Transport, User, StorageService, $rootScope) {
    var SOAPConnectivityTransport = function() {
        this.protocol = "soap";
    };
    var SOAPConnectivityTransport = {
        running: false,
        configs: Transport.configs,
        transactions: Transport.transactions,
        logs: Transport.logs,
        disabled: false,
        protocol: "soap",
        domain: $rootScope.domain.domain,
        send: function(testCaseId) {
            var delay = $q.defer();
            var self = this;
            self.transactions = {};
            Transport.deleteTransaction(testCaseId).then(function(result) {
                var data = angular.fromJson({
                    testStepId: testCaseId,
                    userId: User.info.id,
                    config: Transport.configs[SOAPConnectivityTransport.protocol].data.taInitiator
                });
                $http.post("api/connectivity/send", data, {
                    timeout: 6e4
                }).then(function(response) {
                    if (response.data != null && response.data != "") {
                        self.transactions[testCaseId] = angular.fromJson(response.data);
                    } else {
                        self.transactions[testCaseId] = null;
                    }
                    delay.resolve(self.transactions[testCaseId]);
                }, function(response) {
                    self.transactions[testCaseId] = null;
                    delay.reject(self.transactions[testCaseId]);
                });
            });
            return delay.promise;
        },
        searchTransaction: function(testStepId, config, responseMessageId) {
            return Transport.searchTransaction(testStepId, config, responseMessageId, $rootScope.domain.domain, SOAPConnectivityTransport.protocol);
        },
        stopListener: function(testStepId) {
            return Transport.stopListener(testStepId, $rootScope.domain.domain, SOAPConnectivityTransport.protocol);
        },
        startListener: function(testStepId, responseMessageId) {
            return Transport.startListener(testStepId, responseMessageId, $rootScope.domain.domain, SOAPConnectivityTransport.protocol);
        },
        init: function() {
            this.running = false;
            this.configs = Transport.configs;
            this.transactions = Transport.transactions;
            this.logs = Transport.logs;
            this.disabled = false;
            this.domain = $rootScope.domain.domain;
            this.protocol = "soap";
        }
    };
    return SOAPConnectivityTransport;
});

angular.module("doc").factory("DocumentationManager", [ "$q", "$http", function($q, $http) {
    var manager = {
        getInstallationGuide: function() {
            var delay = $q.defer();
            $http.get("api/documentation/installationguides", {
                timeout: 6e4
            }).then(function(object) {
                if (object.data != null && object.data != "") {
                    delay.resolve(angular.fromJson(object.data));
                } else {
                    delay.resolve(null);
                }
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        getTestCaseDocuments: function(domain, scope) {
            var delay = $q.defer();
            $http.get("api/documentation/testcases", {
                timeout: 6e4,
                params: {
                    domain: domain,
                    scope: scope
                }
            }).then(function(object) {
                if (object.data != null && object.data != "") {
                    delay.resolve(angular.fromJson(object.data));
                } else {
                    delay.resolve(null);
                }
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        getDocuments: function(domain, scope, type) {
            var delay = $q.defer();
            $http.get("api/documentation/documents", {
                params: {
                    domain: domain,
                    scope: scope,
                    type: type
                }
            }).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        saveDocument: function(document) {
            var delay = $q.defer();
            $http.post("api/documentation/documents", document).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        deleteDocument: function(id) {
            var delay = $q.defer();
            $http.post("api/documentation/documents/" + id + "/delete").then(function(object) {
                delay.resolve(object.data);
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        publishDocument: function(id) {
            var delay = $q.defer();
            $http.post("api/documentation/documents/" + id + "/publish").then(function(object) {
                delay.resolve(object.data);
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        }
    };
    return manager;
} ]);

angular.module("domains").factory("DomainsManager", [ "$q", "$http", function($q, $http) {
    var manager = {
        getUserDomains: function() {
            var delay = $q.defer();
            $http.get("api/domains/findByUser", {
                timeout: 6e4
            }).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        getDomains: function() {
            var delay = $q.defer();
            $http.get("api/domains", {
                timeout: 6e4
            }).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        findByUserAndRole: function() {
            var delay = $q.defer();
            $http.get("api/domains/findByUserAndRole", {
                timeout: 6e4
            }).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        getDomainsByScope: function(scope) {
            var delay = $q.defer();
            $http.get("api/domains/searchByScope" + {
                params: {
                    scope: scope
                }
            }).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        getDomainById: function(id) {
            var delay = $q.defer();
            $http.get("api/domains/" + id, {
                timeout: 6e4
            }).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        canModify: function(id) {
            var delay = $q.defer();
            $http.get("api/domains/" + id + "/canModify", {
                timeout: 6e4
            }).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        getDomainByKey: function(key) {
            var delay = $q.defer();
            $http.get("api/domains/searchByKey", {
                params: {
                    key: key
                }
            }).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        save: function(domain) {
            var delay = $q.defer();
            var data = angular.fromJson(domain);
            $http.post("api/domains/" + domain.id, data).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        publish: function(domainId) {
            var delay = $q.defer();
            $http.post("api/domains/" + domainId + "/publish").then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        unpublish: function(domainId) {
            var delay = $q.defer();
            $http.post("api/domains/" + domainId + "/unpublish").then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        saveAndPublish: function(domain) {
            var delay = $q.defer();
            var data = angular.fromJson(domain);
            $http.post("api/domains/save-publish", data).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        saveAndUnpublish: function(domain) {
            var delay = $q.defer();
            var data = angular.fromJson(domain);
            $http.post("api/domains/save-unpublish", data).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        delete: function(id) {
            var delay = $q.defer();
            $http.post("api/domains/" + id + "/delete").then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        create: function(name, key, scope, homeTitle) {
            var delay = $q.defer();
            var data = angular.fromJson({
                domain: key,
                name: name,
                scope: scope,
                homeTitle: homeTitle
            });
            $http.post("api/domains/create", data).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        getDefaultHomeContent: function() {
            var delay = $q.defer();
            $http.post("api/domains/home-content").then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        getDefaultValueSetCopyright: function() {
            var delay = $q.defer();
            $http.post("api/domains/valueset-copyright").then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        getDefaultProfileInfo: function() {
            var delay = $q.defer();
            $http.post("api/domains/profile-info").then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        getDefaultMessageContent: function() {
            var delay = $q.defer();
            $http.post("api/domains/message-content").then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        getDefaultValidationResultInfo: function() {
            var delay = $q.defer();
            $http.post("api/domains/validation-result-info").then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        }
    };
    return manager;
} ]);

angular.module("logs").factory("ValidationLogService", [ "$q", "$http", function($q, $http) {
    var service = {
        getTotalCount: function(domain) {
            var delay = $q.defer();
            $http.get("api/logs/validation/" + domain + "/count", {
                timeout: 18e4
            }).then(function(object) {
                delay.resolve(object.data);
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        getAll: function(domain) {
            var delay = $q.defer();
            $http.get("api/logs/validation/" + domain, {
                timeout: 18e4
            }).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        getById: function(logId) {
            var delay = $q.defer();
            $http.get("api/logs/validation/" + logId, {
                timeout: 18e4
            }).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        deleteLog: function(logId) {
            var delay = $q.defer();
            $http.post("api/logs/validation/" + logId + "/delete").then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        }
    };
    return service;
} ]);

angular.module("logs").factory("TransportLogService", [ "$q", "$http", function($q, $http) {
    var service = {
        getTotalCount: function(domain) {
            var delay = $q.defer();
            $http.get("api/logs/transport/" + domain + "/count", {
                timeout: 18e4
            }).then(function(object) {
                delay.resolve(object.data);
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        getAll: function(domain) {
            var delay = $q.defer();
            $http.get("api/logs/transport/" + domain, {
                timeout: 18e4
            }).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        getById: function(logId) {
            var delay = $q.defer();
            $http.get("api/logs/transport/" + logId, {
                timeout: 18e4
            }).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        deleteLog: function(logId) {
            var delay = $q.defer();
            $http.post("api/logs/transport/" + logId + "/delete").then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        }
    };
    return service;
} ]);

angular.module("hit-settings").factory("SettingsService", [ "$q", "$http", "StorageService", function($q, $http, StorageService) {
    var options = StorageService.get(StorageService.SETTINGS_KEY) == null ? {
        validation: {
            show: {
                errors: true,
                alerts: true,
                warnings: true,
                affirmatives: false,
                informational: false,
                specerrors: false,
                ignores: true
            }
        }
    } : angular.fromJson(StorageService.get(StorageService.SETTINGS_KEY));
    var settings = {
        options: options,
        set: function(options) {
            settings.options = options;
            StorageService.set(StorageService.SETTINGS_KEY, angular.toJson(options));
        },
        getValidationClassifications: function(domain) {
            var delay = $q.defer();
            $http.get("api/hl7v2/validationconfig/" + domain.domain + "/getClassifications").then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        saveValidationClassifications: function(classificationsData, domain) {
            var delay = $q.defer();
            var data = angular.fromJson(classificationsData);
            $http.post("api/hl7v2/validationconfig/" + domain.domain + "/saveClassifications", data).then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        },
        resetClassifications: function(domain) {
            var delay = $q.defer();
            $http.get("api/hl7v2/validationconfig/getDefaultClassifications").then(function(object) {
                delay.resolve(angular.fromJson(object.data));
            }, function(response) {
                delay.reject(response.data);
            });
            return delay.promise;
        }
    };
    return settings;
} ]);

"use strict";

angular.module("main").controller("MainCtrl", function($scope, $rootScope, i18n, $location, userInfoService, $modal, $filter, base64, $http, Idle, Notification, IdleService, StorageService, TestingSettings, Session, AppInfo, User, $templateCache, $window, $sce, DomainsManager, $timeout, Transport, myService) {
    $rootScope.loginDialog = null;
    $rootScope.started = false;
    $scope.isMainPage = function() {
        return !$location.url().includes("/onc") && !$location.url().includes("/svap");
    };
    $scope.setDisplayApp = function(val) {
        $scope.displayApp = val;
    };
    $scope.changeDomain = function(domain) {
        if (domain === "iz") {
            $location.path("/onc");
        } else if (domain === "iz-hti-1-svap") {
            $location.path("/svap");
        }
    };
    $scope.displayApp = false;
    var domainParam = $location.search()["d"] ? decodeURIComponent($location.search()["d"]) : null;
    $scope.language = function() {
        return i18n.language;
    };
    $scope.setLanguage = function(lang) {
        i18n.setLanguage(lang);
    };
    $scope.activeWhen = function(value) {
        return value ? "active" : "";
    };
    $scope.activeIfInList = function(value, pathsList) {
        var found = false;
        if (angular.isArray(pathsList) === false) {
            return "";
        }
        var i = 0;
        while (i < pathsList.length && found === false) {
            if (pathsList[i] === value) {
                return "active";
            }
            i++;
        }
        return "";
    };
    $scope.path = function() {
        return $location.url();
    };
    $scope.login = function() {
        $scope.$emit("event:loginRequest", $scope.username, $scope.password);
    };
    $scope.loginAndRedirect = function(path) {
        $scope.$emit("event:loginRedirectRequest", $scope.username, $scope.password, path);
    };
    $scope.loginReq = function() {
        if ($rootScope.loginMessage()) {
            $rootScope.loginMessage().text = "";
            $rootScope.loginMessage().show = false;
        }
        $scope.$emit("event:loginRequired");
    };
    $scope.logout = function() {
        $scope.execLogout();
    };
    $scope.execLogout = function() {
        userInfoService.setCurrentUser(null);
        $scope.username = $scope.password = null;
        $scope.$emit("event:logoutRequest");
        $location.url("/home");
        $window.location.reload();
    };
    $scope.cancel = function() {
        $scope.$emit("event:loginCancel");
    };
    $scope.isAuthenticated = function() {
        return userInfoService.isAuthenticated();
    };
    $scope.isPending = function() {
        return userInfoService.isPending();
    };
    $scope.isSupervisor = function() {
        return userInfoService.isSupervisor();
    };
    $scope.isPublisher = function() {
        return userInfoService.isPublisher();
    };
    $scope.isTester = function() {
        return userInfoService.isTester();
    };
    $scope.isAdmin = function() {
        return userInfoService.isAdmin();
    };
    $scope.getRoleAsString = function() {
        if ($scope.isTester() === true) {
            return "tester";
        }
        if ($scope.isSupervisor() === true) {
            return "Supervisor";
        }
        if ($scope.isAdmin() === true) {
            return "Admin";
        }
        return "undefined";
    };
    $scope.getUsername = function() {
        if (userInfoService.isAuthenticated() === true) {
            return userInfoService.getUsername();
        }
        return "";
    };
    $rootScope.showLoginDialog = function(path) {
        if ($rootScope.loginDialog && $rootScope.loginDialog != null && $rootScope.loginDialog.opened) {
            $rootScope.loginDialog.dismiss("cancel");
        }
        $rootScope.loginDialog = $modal.open({
            backdrop: "static",
            keyboard: "false",
            controller: "LoginCtrl",
            size: "lg",
            templateUrl: "views/account/login.html",
            resolve: {
                user: function() {
                    return {
                        username: $scope.username,
                        password: $scope.password
                    };
                }
            }
        });
        $rootScope.loginDialog.result.then(function(result) {
            if (result) {
                $scope.username = result.username;
                $scope.password = result.password;
                if (path !== undefined) {
                    $scope.loginAndRedirect(path + "&loggedin=true");
                } else {
                    $scope.login();
                }
            } else {
                $scope.cancel();
            }
        });
    };
    $rootScope.started = false;
    Idle.watch();
    $rootScope.$on("IdleStart", function() {
        closeModals();
        $rootScope.warning = $modal.open({
            templateUrl: "warning-dialog.html",
            windowClass: "modal-danger"
        });
    });
    $rootScope.$on("IdleEnd", function() {
        closeModals();
    });
    $rootScope.$on("IdleTimeout", function() {
        closeModals();
        if ($scope.isAuthenticated()) {
            $rootScope.$emit("event:execLogout");
            $rootScope.timedout = $modal.open({
                templateUrl: "timedout-dialog.html",
                windowClass: "modal-danger"
            });
        } else {
            StorageService.clearAll();
            Session.delete().then(function(response) {
                $rootScope.timedout = $modal.open({
                    templateUrl: "timedout-dialog.html",
                    windowClass: "modal-danger",
                    backdrop: true,
                    keyboard: "false",
                    controller: "FailureCtrl",
                    resolve: {
                        error: function() {
                            return "";
                        }
                    }
                });
                $rootScope.timedout.result.then(function() {
                    $rootScope.clearTemplate();
                    $rootScope.reloadPage();
                }, function() {
                    $rootScope.clearTemplate();
                    $rootScope.reloadPage();
                });
            });
        }
    });
    $scope.$on("Keepalive", function() {
        if ($scope.isAuthenticated()) {
            IdleService.keepAlive();
        }
    });
    $rootScope.$on("Keepalive", function() {
        IdleService.keepAlive();
    });
    $rootScope.$on("event:execLogout", function() {
        $scope.execLogout();
    });
    function closeModals() {
        if ($rootScope.warning) {
            $rootScope.warning.close();
            $rootScope.warning = null;
        }
        if ($rootScope.timedout) {
            $rootScope.timedout.close();
            $rootScope.timedout = null;
        }
    }
    $rootScope.start = function() {
        closeModals();
        Idle.watch();
        $rootScope.started = true;
    };
    $rootScope.stop = function() {
        closeModals();
        Idle.unwatch();
        $rootScope.started = false;
    };
    $scope.checkForIE = function() {
        var BrowserDetect = {
            init: function() {
                this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
                this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "an unknown version";
                this.OS = this.searchString(this.dataOS) || "an unknown OS";
            },
            searchString: function(data) {
                for (var i = 0; i < data.length; i++) {
                    var dataString = data[i].string;
                    var dataProp = data[i].prop;
                    this.versionSearchString = data[i].versionSearch || data[i].identity;
                    if (dataString) {
                        if (dataString.indexOf(data[i].subString) !== -1) {
                            return data[i].identity;
                        }
                    } else if (dataProp) {
                        return data[i].identity;
                    }
                }
            },
            searchVersion: function(dataString) {
                var index = dataString.indexOf(this.versionSearchString);
                if (index === -1) {
                    return;
                }
                return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
            },
            dataBrowser: [ {
                string: navigator.userAgent,
                subString: "Chrome",
                identity: "Chrome"
            }, {
                string: navigator.userAgent,
                subString: "OmniWeb",
                versionSearch: "OmniWeb/",
                identity: "OmniWeb"
            }, {
                string: navigator.vendor,
                subString: "Apple",
                identity: "Safari",
                versionSearch: "Version"
            }, {
                prop: window.opera,
                identity: "Opera",
                versionSearch: "Version"
            }, {
                string: navigator.vendor,
                subString: "iCab",
                identity: "iCab"
            }, {
                string: navigator.vendor,
                subString: "KDE",
                identity: "Konqueror"
            }, {
                string: navigator.userAgent,
                subString: "Firefox",
                identity: "Firefox"
            }, {
                string: navigator.vendor,
                subString: "Camino",
                identity: "Camino"
            }, {
                string: navigator.userAgent,
                subString: "Netscape",
                identity: "Netscape"
            }, {
                string: navigator.userAgent,
                subString: "MSIE",
                identity: "Explorer",
                versionSearch: "MSIE"
            }, {
                string: navigator.userAgent,
                subString: "Gecko",
                identity: "Mozilla",
                versionSearch: "rv"
            }, {
                string: navigator.userAgent,
                subString: "Mozilla",
                identity: "Netscape",
                versionSearch: "Mozilla"
            } ],
            dataOS: [ {
                string: navigator.platform,
                subString: "Win",
                identity: "Windows"
            }, {
                string: navigator.platform,
                subString: "Mac",
                identity: "Mac"
            }, {
                string: navigator.userAgent,
                subString: "iPhone",
                identity: "iPhone/iPod"
            }, {
                string: navigator.platform,
                subString: "Linux",
                identity: "Linux"
            } ]
        };
        BrowserDetect.init();
        if (BrowserDetect.browser === "Explorer") {
            var title = "You are using Internet Explorer";
            var msg = "This site is not yet optimized with Internet Explorer. For the best user experience, please use Chrome, Firefox or Safari. Thank you for your patience.";
            var btns = [ {
                result: "ok",
                label: "OK",
                cssClass: "btn"
            } ];
        }
    };
    $rootScope.readonly = false;
    $scope.scrollbarWidth = 0;
    $rootScope.showError = function(error) {
        var modalInstance = $modal.open({
            templateUrl: "ErrorDlgDetails.html",
            controller: "ErrorDetailsCtrl",
            resolve: {
                error: function() {
                    return error;
                }
            }
        });
        modalInstance.result.then(function(error) {
            $rootScope.error = error;
        }, function() {});
    };
    $rootScope.openRichTextDlg = function(obj, key, title, disabled) {
        var modalInstance = $modal.open({
            templateUrl: "RichTextCtrl.html",
            controller: "RichTextCtrl",
            windowClass: "app-modal-window",
            backdrop: true,
            keyboard: true,
            backdropClick: false,
            resolve: {
                editorTarget: function() {
                    return {
                        key: key,
                        obj: obj,
                        disabled: disabled,
                        title: title
                    };
                }
            }
        });
    };
    $rootScope.openInputTextDlg = function(obj, key, title, disabled) {
        var modalInstance = $modal.open({
            templateUrl: "InputTextCtrl.html",
            controller: "InputTextCtrl",
            backdrop: true,
            keyboard: true,
            windowClass: "app-modal-window",
            backdropClick: false,
            resolve: {
                editorTarget: function() {
                    return {
                        key: key,
                        obj: obj,
                        disabled: disabled,
                        title: title
                    };
                }
            }
        });
    };
    $rootScope.showError = function(error) {
        var modalInstance = $modal.open({
            templateUrl: "ErrorDlgDetails.html",
            controller: "ErrorDetailsCtrl",
            resolve: {
                error: function() {
                    return error;
                }
            }
        });
        modalInstance.result.then(function(error) {
            $rootScope.error = error;
        }, function() {});
    };
    $rootScope.cutString = function(str) {
        if (str.length > 20) str = str.substring(0, 20) + "...";
        return str;
    };
    $rootScope.toHTML = function(content) {
        return $sce.trustAsHtml(content);
    };
    $rootScope.selectTestingType = function(value) {
        $rootScope.tabs[0] = false;
        $rootScope.tabs[1] = false;
        $rootScope.tabs[2] = false;
        $rootScope.tabs[3] = false;
        $rootScope.tabs[4] = false;
        $rootScope.tabs[5] = false;
        $rootScope.activeTab = value;
        $rootScope.tabs[$rootScope.activeTab] = true;
        TestingSettings.setActiveTab($rootScope.activeTab);
    };
    $rootScope.downloadArtifact = function(path) {
        var form = document.createElement("form");
        form.action = "api/artifact/download";
        form.method = "POST";
        form.target = "_target";
        var input = document.createElement("input");
        input.name = "path";
        input.value = path;
        form.appendChild(input);
        form.style.display = "none";
        document.body.appendChild(form);
        form.submit();
    };
    $rootScope.tabs = new Array();
    $rootScope.compile = function(content) {
        return $compile(content);
    };
    $rootScope.$on("$locationChangeSuccess", function() {
        $rootScope.setActive($location.path());
    });
    $rootScope.openValidationResultInfo = function() {
        var modalInstance = $modal.open({
            templateUrl: "ValidationResultInfoCtrl.html",
            windowClass: "profile-modal",
            controller: "ValidationResultInfoCtrl"
        });
    };
    $rootScope.openVersionChangeDlg = function() {
        StorageService.clearAll();
        if (!$rootScope.vcModalInstance || $rootScope.vcModalInstance === null || !$rootScope.vcModalInstance.opened) {
            $rootScope.vcModalInstance = $modal.open({
                templateUrl: "VersionChanged.html",
                size: "lg",
                backdrop: "static",
                keyboard: "false",
                controller: "FailureCtrl",
                resolve: {
                    error: function() {
                        return "";
                    }
                }
            });
            $rootScope.vcModalInstance.result.then(function() {
                $rootScope.clearTemplate();
                $rootScope.reloadPage();
            }, function() {
                $rootScope.clearTemplate();
                $rootScope.reloadPage();
            });
        }
    };
    $rootScope.openCriticalErrorDlg = function(errorMessage) {
        StorageService.clearAll();
        if (!$rootScope.errorModalInstance || $rootScope.errorModalInstance === null || !$rootScope.errorModalInstance.opened) {
            $rootScope.errorModalInstance = $modal.open({
                templateUrl: "CriticalError.html",
                size: "lg",
                backdrop: true,
                keyboard: "true",
                controller: "FailureCtrl",
                resolve: {
                    error: function() {
                        return errorMessage;
                    }
                }
            });
            $rootScope.errorModalInstance.result.then(function() {
                $rootScope.clearTemplate();
                $rootScope.reloadPage();
            }, function() {
                $rootScope.clearTemplate();
                $rootScope.reloadPage();
            });
        }
    };
    $rootScope.openUnknownDomainDlg = function(domain) {
        StorageService.clearAll();
        $modal.open({
            templateUrl: "UnknownDomain.html",
            size: "lg",
            backdrop: false,
            keyboard: "false",
            controller: "UnknownDomainCtrl",
            resolve: {
                domain: function() {
                    return domain;
                }
            }
        }).result.then(function(newDomain) {
            $rootScope.selectDomain(newDomain);
        }, function() {});
    };
    $rootScope.openSessionExpiredDlg = function() {
        StorageService.clearAll();
        if (!$rootScope.sessionExpiredModalInstance || $rootScope.sessionExpiredModalInstance === null || !$rootScope.sessionExpiredModalInstance.opened) {
            $rootScope.sessionExpiredModalInstance = $modal.open({
                templateUrl: "timedout-dialog.html",
                size: "lg",
                backdrop: true,
                keyboard: "true",
                controller: "FailureCtrl",
                resolve: {
                    error: function() {
                        return "";
                    }
                }
            });
            $rootScope.sessionExpiredModalInstance.result.then(function() {
                $rootScope.clearTemplate();
                $rootScope.reloadPage();
            }, function() {
                $rootScope.clearTemplate();
                $rootScope.reloadPage();
            });
        }
    };
    $rootScope.clearTemplate = function() {
        $templateCache.removeAll();
    };
    $rootScope.openErrorDlg = function() {
        $location.path("/error");
    };
    $rootScope.pettyPrintType = function(type) {
        return type === "TestStep" ? "Test Step" : type === "TestCase" ? "Test Case" : type;
    };
    $rootScope.openInvalidReqDlg = function() {
        if (!$rootScope.errorModalInstance || $rootScope.errorModalInstance === null || !$rootScope.errorModalInstance.opened) {
            $rootScope.errorModalInstance = $modal.open({
                templateUrl: "InvalidReqCtrl.html",
                size: "lg",
                backdrop: true,
                keyboard: "false",
                controller: "FailureCtrl",
                resolve: {
                    error: function() {
                        return "";
                    }
                }
            });
            $rootScope.errorModalInstance.result.then(function() {
                $rootScope.reloadPage();
            }, function() {
                $rootScope.reloadPage();
            });
        }
    };
    $rootScope.openNotFoundDlg = function() {
        if (!$rootScope.errorModalInstance || $rootScope.errorModalInstance === null || !$rootScope.errorModalInstance.opened) {
            $rootScope.errorModalInstance = $modal.open({
                templateUrl: "NotFoundCtrl.html",
                size: "lg",
                backdrop: true,
                keyboard: "false",
                controller: "FailureCtrl",
                resolve: {
                    error: function() {
                        return "";
                    }
                }
            });
            $rootScope.errorModalInstance.result.then(function() {
                $rootScope.reloadPage();
            }, function() {
                $rootScope.reloadPage();
            });
        }
    };
    $rootScope.getDomain = function() {
        return $rootScope.domain;
    };
    $rootScope.nav = function(target) {
        $location.path(target);
    };
    $rootScope.showSettings = function() {
        var modalInstance = $modal.open({
            templateUrl: "views/settings/SettingsCtrl.html",
            windowClass: "upload-modal",
            keyboard: "false",
            controller: "SettingsCtrl"
        });
    };
    $scope.init = function() {};
    $scope.getFullName = function() {
        if (userInfoService.isAuthenticated() === true) {
            return userInfoService.getFullName();
        }
        return "";
    };
    $rootScope.isEditable = function() {
        return userInfoService.isAuthenticated() && (userInfoService.isAdmin() || userInfoService.isSupervisor()) && $rootScope.domain != null && $rootScope.domain.owner === userInfoService.getUsername();
    };
    $rootScope.hasWriteAccess = function() {
        return userInfoService.isAuthenticated() && (userInfoService.isAdmin() || $rootScope.domain != null && $rootScope.domain.owner === userInfoService.getUsername());
    };
    $rootScope.canPublish = function() {
        return userInfoService.isAuthenticated() && userInfoService.isAdmin();
    };
    $rootScope.createDomain = function() {
        var modalInstance = $modal.open({
            templateUrl: "views/domains/create.html",
            controller: "CreateDomainCtrl",
            size: "md",
            backdrop: "static",
            keyboard: false,
            backdropClick: false,
            resolve: {
                scope: function() {
                    return "USER";
                }
            }
        });
        modalInstance.result.then(function(newDomain) {
            if (newDomain) {
                $rootScope.selectDomain(newDomain.domain);
            } else if ($rootScope.domain === null || $rootScope.domain === undefined) {
                $rootScope.reloadPage();
            }
        }, function() {
            $rootScope.reloadPage();
        });
    };
    $rootScope.domainsByOwner = {
        my: [],
        others: []
    };
    $rootScope.initDomainsByOwner = function() {
        for (var i = 0; i < $rootScope.appInfo.domains.length; i++) {
            if ($rootScope.appInfo.domains[i].owner === userInfoService.getUsername()) {
                $rootScope.domainsByOwner["my"].push($rootScope.appInfo.domains[i]);
            } else {
                $rootScope.domainsByOwner["others"].push($rootScope.appInfo.domains[i]);
            }
        }
    };
    $rootScope.displayOwnership = function(dom) {
        return dom.owner === userInfoService.getUsername() ? "My Tool Scopes" : "Others Tool Scopes";
    };
    $rootScope.orderOwnership = function(dom) {
        return dom.owner === userInfoService.getUsername() ? 0 : 1;
    };
});

angular.module("main").controller("LoginCtrl", [ "$scope", "$modalInstance", "user", "$rootScope", function($scope, $modalInstance, user, $rootScope) {
    $scope.user = user;
    $scope.appInfo = $rootScope.appInfo;
    $scope.cancel = function() {
        $modalInstance.dismiss("cancel");
    };
    $scope.login = function() {
        $modalInstance.close($scope.user);
    };
    $scope.cancelAndRedirect = function(path) {
        $modalInstance.dismiss("cancel");
        $location.url(path);
    };
    $scope.login = function() {
        $modalInstance.close($scope.user);
    };
    $scope.loginAndRedirect = function(path) {
        $modalInstance.close($scope.user);
        $location.url(path);
    };
    $scope.loginAndReload = function() {
        $modalInstance.close($scope.user);
        $route.reload();
    };
} ]);

angular.module("main").controller("UnknownDomainCtrl", [ "$scope", "$modalInstance", "StorageService", "$window", "domain", "userInfoService", "$rootScope", function($scope, $modalInstance, StorageService, $window, error, domain, userInfoService, $rootScope) {
    $scope.error = error;
    $scope.domain = domain;
    $scope.selectedDomain = {
        domain: null
    };
    $scope.selectDomain = function() {
        StorageService.set(StorageService.APP_SELECTED_DOMAIN, $scope.selectedDomain.domain);
        $modalInstance.close($scope.selectedDomain.domain);
    };
    $scope.createNewDomain = function() {
        $modalInstance.close("New");
    };
    $scope.loginReq = function() {
        $scope.$emit("event:loginRequired");
    };
} ]);

angular.module("main").controller("RichTextCtrl", [ "$scope", "$modalInstance", "editorTarget", function($scope, $modalInstance, editorTarget) {
    $scope.editorTarget = editorTarget;
    $scope.cancel = function() {
        $modalInstance.dismiss("cancel");
    };
    $scope.close = function() {
        $modalInstance.close($scope.editorTarget);
    };
} ]);

angular.module("main").controller("InputTextCtrl", [ "$scope", "$modalInstance", "editorTarget", function($scope, $modalInstance, editorTarget) {
    $scope.editorTarget = editorTarget;
    $scope.cancel = function() {
        $modalInstance.dismiss("cancel");
    };
    $scope.close = function() {
        $modalInstance.close($scope.editorTarget);
    };
} ]);

angular.module("main").controller("ConfirmLogoutCtrl", [ "$scope", "$modalInstance", "$rootScope", "$http", function($scope, $modalInstance, $rootScope, $http) {
    $scope.logout = function() {
        $modalInstance.close();
    };
    $scope.cancel = function() {
        $modalInstance.dismiss("cancel");
    };
} ]);

angular.module("main").controller("MessageWithHexadecimalDlgCtrl", function($scope, $modalInstance, original, MessageUtil) {
    $scope.showHex = true;
    var messageWithHexadecimal = MessageUtil.toHexadecimal(original);
    $scope.message = messageWithHexadecimal;
    $scope.toggleHexadecimal = function() {
        $scope.showHex = !$scope.showHex;
        $scope.message = $scope.showHex ? messageWithHexadecimal : original;
    };
    $scope.close = function() {
        $modalInstance.dismiss("cancel");
    };
});

angular.module("main").controller("ValidationResultDetailsCtrl", function($scope, $modalInstance, selectedElement) {
    $scope.selectedElement = selectedElement;
    $scope.ok = function() {
        $modalInstance.close($scope.selectedElement);
    };
    $scope.cancel = function() {
        $modalInstance.dismiss("cancel");
    };
});

angular.module("main").controller("ConfirmDialogCtrl", function($scope, $modalInstance) {
    $scope.confirm = function() {
        $modalInstance.close(true);
    };
    $scope.cancel = function() {
        $modalInstance.dismiss("cancel");
    };
});

angular.module("transport").controller("TransportConfigListCtrl", [ "$scope", "Transport", "StorageService", "$http", "User", "$timeout", "$rootScope", function($scope, Transport, StorageService, $http, User, $timeout, $rootScope) {
    $scope.transport = Transport;
    $scope.loading = false;
    $scope.error = null;
    $scope.protocols = [];
    $scope.selectedProtocol = null;
    $scope.hasConfigs = function() {
        return $scope.transport.configs ? Object.getOwnPropertyNames($scope.transport.configs).length > 0 : false;
    };
    $scope.getProtocols = function() {
        return $scope.transport.configs ? Object.getOwnPropertyNames($scope.transport.configs) : [];
    };
    $scope.getProtoDescription = function(protocol) {
        try {
            return $scope.transport.configs[protocol]["description"];
        } catch (error) {}
        return null;
    };
    $scope.getConfigs = function() {
        return $scope.transport.configs;
    };
    $scope.initTransportConfigList = function() {
        $scope.error = null;
    };
    $scope.selectProtocol = function(protocolKey) {
        $scope.selectedProtocol = Transport.configs[protocolKey];
        $scope.$broadcast("load-transport-data", protocolKey);
    };
    $scope.isActiveProtocol = function(proto) {
        return $scope.selectedProtocol != null && $scope.selectedProtocol.key === proto;
    };
    $scope.toggleTransport = function(disabled) {
        $scope.transport.disabled = disabled;
        StorageService.set(StorageService.TRANSPORT_DISABLED, disabled);
        if (!disabled) {
            var pr = $scope.getProtocols();
            if (pr != null && pr.length === 1) {
                $scope.selectProtocol(pr[0]);
            }
        }
    };
    var pr = $scope.getProtocols();
    if (pr != null && pr.length === 1) {
        $scope.selectProtocol(pr[0]);
    }
} ]);

angular.module("transport").controller("InitiatorConfigCtrl", function($scope, $modalInstance, htmlForm, config, domain, protocol, $http, User) {
    $scope.config = angular.copy(config);
    $scope.form = htmlForm;
    $scope.domain = domain;
    $scope.protocol = protocol;
    $scope.initInitiatorConfig = function(config) {
        $scope.config = angular.copy(config);
    };
    $scope.save = function() {
        var data = angular.fromJson({
            config: $scope.config,
            userId: User.info.id,
            type: "TA_INITIATOR",
            protocol: $scope.protocol
        });
        $http.post("api/transport/config/save", data);
        $modalInstance.close($scope.config);
    };
    $scope.cancel = function() {
        $modalInstance.dismiss("cancel");
    };
});

angular.module("transport").controller("TaInitiatorConfigCtrl", function($scope, $http, User, StorageService, Transport, $rootScope, Notification) {
    $scope.transport = Transport;
    $scope.config = null;
    $scope.prevConfig = null;
    $scope.loading = false;
    $scope.error = null;
    $scope.proto = null;
    $scope.saved = true;
    $scope.dom = null;
    $scope.message = null;
    $scope.$on("load-transport-data", function(event, protocol) {
        $scope.proto = protocol;
        $scope.dom = $rootScope.domain.domain;
        $scope.loadData();
    });
    $scope.initTaInitiatorConfig = function(domain, protocol) {
        if (protocol && protocol != null && domain && domain != null) {
            $scope.proto = protocol;
            $scope.dom = domain;
            $scope.message = null;
            $scope.loadData();
        } else {
            $scope.error = "Protocol or domain not defined.";
        }
    };
    $scope.loadData = function() {
        $scope.config = angular.copy($scope.transport.configs[$scope.proto]["data"]["taInitiator"]);
        $scope.prevConfig = angular.copy($scope.config);
        $scope.message = null;
    };
    $scope.save = function() {
        $scope.error = null;
        $scope.message = null;
        var data = angular.fromJson({
            config: $scope.config,
            userId: User.info.id,
            type: "TA_INITIATOR",
            protocol: $scope.proto,
            domain: $scope.dom
        });
        $http.post("api/transport/config/save", data).then(function(result) {
            $scope.transport.configs[$scope.proto]["data"]["taInitiator"] = $scope.config;
            $scope.loadData();
            $scope.saved = true;
            Notification.success({
                message: "Configuration Information Saved !",
                templateUrl: "NotificationSuccessTemplate.html",
                scope: $rootScope,
                delay: 5e3
            });
        }, function(error) {
            Notification.error({
                message: error.data,
                templateUrl: "NotificationErrorTemplate.html",
                scope: $rootScope,
                delay: 1e4
            });
            $scope.saved = false;
            $scope.message = null;
        });
    };
    $scope.reset = function() {
        $scope.config = angular.copy($scope.prevConfig);
        $scope.saved = true;
    };
});

angular.module("transport").controller("SutInitiatorConfigCtrl", function($scope, $http, Transport, $rootScope, User, Notification) {
    $scope.transport = Transport;
    $scope.config = null;
    $scope.loading = false;
    $scope.saving = false;
    $scope.error = null;
    $scope.proto = null;
    $scope.dom = null;
    $scope.$on("load-transport-data", function(event, protocol) {
        $scope.proto = protocol;
        $scope.dom = $rootScope.domain.domain;
        $scope.loadData();
    });
    $scope.initSutInitiatorConfig = function(domain, protocol) {
        if (protocol && protocol != null && domain && domain != null) {
            $scope.proto = protocol;
            $scope.dom = domain;
            $scope.loadData();
        } else {
            $scope.error = "Protocol or domain not defined.";
        }
    };
    $scope.loadData = function() {
        $scope.config = $scope.transport.configs[$scope.proto]["data"]["sutInitiator"];
    };
    $scope.save = function() {
        var config = $scope.config;
        if (config) {
            $scope.saving = true;
            var tmpConfig = angular.copy(config);
            delete tmpConfig["password"];
            delete tmpConfig["username"];
            var data = angular.fromJson({
                config: $scope.config,
                userId: User.info.id,
                type: "SUT_INITIATOR",
                protocol: $scope.proto,
                domain: $scope.dom
            });
            $http.post("api/transport/config/save", data).then(function(result) {
                $scope.saving = false;
                Notification.success({
                    message: "Configuration Information Saved !",
                    templateUrl: "NotificationSuccessTemplate.html",
                    scope: $rootScope,
                    delay: 5e3
                });
            }, function(error) {
                $scope.saving = false;
                $scope.error = error;
                Notification.error({
                    message: error.data,
                    templateUrl: "NotificationErrorTemplate.html",
                    scope: $rootScope,
                    delay: 1e4
                });
            });
        }
    };
});

angular.module("transport").controller("CreateTransportConfigCtrl", function($scope, $modalInstance, scope, DomainsManager) {});

"use strict";

angular.module("account").controller("UserProfileCtrl", [ "$scope", "$resource", "AccountLoader", "Account", "userInfoService", "$location", "Transport", "Notification", function($scope, $resource, AccountLoader, Account, userInfoService, $location, Transport, Notification) {
    var PasswordChange = $resource("api/accounts/:id/passwordchange", {
        id: "@id"
    });
    $scope.accountpwd = {};
    $scope.initModel = function(data) {
        $scope.account = data;
        $scope.accountOrig = angular.copy($scope.account);
    };
    $scope.updateAccount = function() {
        new Account($scope.account).$save().then(function() {}, function(error) {
            Notification.error({
                message: error.data,
                templateUrl: "NotificationErrorTemplate.html",
                scope: $scope,
                delay: 5e4
            });
        });
        $scope.accountOrig = angular.copy($scope.account);
    };
    $scope.resetForm = function() {
        $scope.account = angular.copy($scope.accountOrig);
    };
    $scope.isUnchanged = function(formData) {
        return angular.equals(formData, $scope.accountOrig);
    };
    $scope.changePassword = function() {
        var user = new PasswordChange();
        user.username = $scope.account.username;
        user.password = $scope.accountpwd.currentPassword;
        user.newPassword = $scope.accountpwd.newPassword;
        user.id = $scope.account.id;
        user.$save().then(function(result) {
            $scope.msg = angular.fromJson(result);
        }, function(error) {
            Notification.error({
                message: error.data,
                templateUrl: "NotificationErrorTemplate.html",
                scope: $scope,
                delay: 5e4
            });
        });
    };
    $scope.deleteAccount = function() {
        var tmpAcct = new Account();
        tmpAcct.id = $scope.account.id;
        tmpAcct.$remove(function() {
            userInfoService.setCurrentUser(null);
            $scope.$emit("event:logoutRequest");
            $location.url("/home");
        }, function(error) {
            Notification.error({
                message: error.data,
                templateUrl: "NotificationErrorTemplate.html",
                scope: $scope,
                delay: 5e4
            });
        });
    };
    AccountLoader(userInfoService.getAccountID()).then(function(data) {
        $scope.initModel(data);
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    }, function(error) {
        Notification.error({
            message: error.data,
            templateUrl: "NotificationErrorTemplate.html",
            scope: $scope,
            delay: 5e4
        });
    });
} ]);

angular.module("account").controller("UserAccountCtrl", [ "$scope", "$resource", "AccountLoader", "Account", "userInfoService", "$location", "$rootScope", function($scope, $resource, AccountLoader, Account, userInfoService, $location, $rootScope) {
    $scope.accordi = {
        account: true,
        accounts: false
    };
    $scope.setSubActive = function(id) {
        if (id && id !== null) {
            $rootScope.setSubActive(id);
            $(".accountMgt").hide();
            $("#" + id).show();
        }
    };
    $scope.initAccount = function() {
        if ($rootScope.subActivePath === null) {
            $rootScope.subActivePath = "account";
        }
        $scope.setSubActive($rootScope.subActivePath);
    };
} ]);

angular.module("account").directive("stDateRange", [ "$timeout", function($timeout) {
    return {
        restrict: "E",
        require: "^stTable",
        scope: {
            before: "=",
            after: "="
        },
        templateUrl: "stDateRange.html",
        link: function(scope, element, attr, table) {
            var inputs = element.find("input");
            var inputBefore = angular.element(inputs[0]);
            var inputAfter = angular.element(inputs[1]);
            var predicateName = attr.predicate;
            [ inputBefore, inputAfter ].forEach(function(input) {
                input.bind("blur", function() {
                    var query = {};
                    if (!scope.isBeforeOpen && !scope.isAfterOpen) {
                        if (scope.before) {
                            query.before = scope.before;
                        }
                        if (scope.after) {
                            query.after = scope.after;
                        }
                        scope.$apply(function() {
                            table.search(query, predicateName);
                        });
                    }
                });
            });
            function open(before) {
                return function($event) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    if (before) {
                        scope.isBeforeOpen = true;
                    } else {
                        scope.isAfterOpen = true;
                    }
                };
            }
            scope.openBefore = open(true);
            scope.openAfter = open();
        }
    };
} ]).directive("stNumberRange", [ "$timeout", function($timeout) {
    return {
        restrict: "E",
        require: "^stTable",
        scope: {
            lower: "=",
            higher: "="
        },
        templateUrl: "stNumberRange.html",
        link: function(scope, element, attr, table) {
            var inputs = element.find("input");
            var inputLower = angular.element(inputs[0]);
            var inputHigher = angular.element(inputs[1]);
            var predicateName = attr.predicate;
            [ inputLower, inputHigher ].forEach(function(input, index) {
                input.bind("blur", function() {
                    var query = {};
                    if (scope.lower) {
                        query.lower = scope.lower;
                    }
                    if (scope.higher) {
                        query.higher = scope.higher;
                    }
                    scope.$apply(function() {
                        table.search(query, predicateName);
                    });
                });
            });
        }
    };
} ]).filter("customFilter", [ "$filter", function($filter) {
    var filterFilter = $filter("filter");
    var standardComparator = function standardComparator(obj, text) {
        text = ("" + text).toLowerCase();
        return ("" + obj).toLowerCase().indexOf(text) > -1;
    };
    return function customFilter(array, expression) {
        function customComparator(actual, expected) {
            var isBeforeActivated = expected.before;
            var isAfterActivated = expected.after;
            var isLower = expected.lower;
            var isHigher = expected.higher;
            var higherLimit;
            var lowerLimit;
            var itemDate;
            var queryDate;
            if (angular.isObject(expected)) {
                if (expected.before || expected.after) {
                    try {
                        if (isBeforeActivated) {
                            higherLimit = expected.before;
                            itemDate = new Date(actual);
                            queryDate = new Date(higherLimit);
                            if (itemDate > queryDate) {
                                return false;
                            }
                        }
                        if (isAfterActivated) {
                            lowerLimit = expected.after;
                            itemDate = new Date(actual);
                            queryDate = new Date(lowerLimit);
                            if (itemDate < queryDate) {
                                return false;
                            }
                        }
                        return true;
                    } catch (e) {
                        return false;
                    }
                } else if (isLower || isHigher) {
                    if (isLower) {
                        higherLimit = expected.lower;
                        if (actual > higherLimit) {
                            return false;
                        }
                    }
                    if (isHigher) {
                        lowerLimit = expected.higher;
                        if (actual < lowerLimit) {
                            return false;
                        }
                    }
                    return true;
                }
                return true;
            }
            return standardComparator(actual, expected);
        }
        var output = filterFilter(array, expression, customComparator);
        return output;
    };
} ]);

angular.module("account").controller("AccountsListCtrl", [ "$scope", "MultiTestersLoader", "MultiSupervisorsLoader", "Account", "$modal", "$resource", "AccountLoader", "userInfoService", "$location", "Notification", function($scope, MultiTestersLoader, MultiSupervisorsLoader, Account, $modal, $resource, AccountLoader, userInfoService, $location, Notification) {
    $scope.tmpAccountList = [].concat($scope.accountList);
    $scope.account = null;
    $scope.accountOrig = null;
    $scope.accountType = "tester";
    $scope.scrollbarWidth = $scope.getScrollbarWidth();
    $scope.authorities = [];
    var PasswordChange = $resource("api/accounts/:id/userpasswordchange", {
        id: "@id"
    });
    var ApproveAccount = $resource("api/accounts/:id/approveaccount", {
        id: "@id"
    });
    var SuspendAccount = $resource("api/accounts/:id/suspendaccount", {
        id: "@id"
    });
    var AccountTypeChange = $resource("api/accounts/:id/useraccounttypechange", {
        id: "@id"
    });
    $scope.msg = null;
    $scope.accountpwd = {};
    $scope.updateAccount = function() {
        new Account($scope.account).$save(function(data) {}, function(error) {
            Notification.error({
                message: error.data,
                templateUrl: "NotificationErrorTemplate.html",
                scope: $scope,
                delay: 5e4
            });
        });
        $scope.accountOrig = angular.copy($scope.account);
    };
    $scope.resetForm = function() {
        $scope.account = angular.copy($scope.accountOrig);
    };
    $scope.isUnchanged = function(formData) {
        return angular.equals(formData, $scope.accountOrig);
    };
    $scope.changePassword = function() {
        var user = new PasswordChange();
        user.username = $scope.account.username;
        user.password = $scope.accountpwd.currentPassword;
        user.newPassword = $scope.accountpwd.newPassword;
        user.id = $scope.account.id;
        user.$save().then(function(result) {
            $scope.msg = angular.fromJson(result);
        }, function(error) {
            Notification.error({
                message: error.data,
                templateUrl: "NotificationErrorTemplate.html",
                scope: $scope,
                delay: 5e4
            });
        });
    };
    $scope.saveAccountType = function() {
        var authorityChange = new AccountTypeChange();
        authorityChange.username = $scope.account.username;
        authorityChange.accountType = $scope.account.accountType;
        authorityChange.id = $scope.account.id;
        authorityChange.$save().then(function(result) {
            $scope.msg = angular.fromJson(result);
        }, function(error) {
            Notification.error({
                message: error.data,
                templateUrl: "NotificationErrorTemplate.html",
                scope: $scope,
                delay: 5e4
            });
        });
    };
    $scope.loadAccounts = function() {
        if (userInfoService.isAuthenticated() && userInfoService.isAdmin()) {
            $scope.msg = null;
            new MultiTestersLoader().then(function(response) {
                $scope.accountList = response;
                $scope.tmpAccountList = [].concat($scope.accountList);
            }, function(error) {
                Notification.error({
                    message: error.data,
                    templateUrl: "NotificationErrorTemplate.html",
                    scope: $scope,
                    delay: 5e4
                });
            });
        }
    };
    $scope.initManageAccounts = function() {
        $scope.loadAccounts();
    };
    $scope.selectAccount = function(row) {
        $scope.accountpwd = {};
        $scope.account = row;
        $scope.authorities = $scope.accountOrig = angular.copy($scope.account);
    };
    $scope.deleteAccount = function() {
        $scope.confirmDelete($scope.account);
    };
    $scope.confirmDelete = function(accountToDelete) {
        var modalInstance = $modal.open({
            templateUrl: "ConfirmAccountDeleteCtrl.html",
            controller: "ConfirmAccountDeleteCtrl",
            resolve: {
                accountToDelete: function() {
                    return accountToDelete;
                },
                accountList: function() {
                    return $scope.accountList;
                }
            }
        });
        modalInstance.result.then(function(accountToDelete) {
            var rowIndex = $scope.accountList.indexOf(accountToDelete);
            if (rowIndex !== -1) {
                $scope.accountList.splice(rowIndex, 1);
            }
            $scope.tmpAccountList = [].concat($scope.accountList);
            $scope.account = null;
        }, function(error) {
            Notification.error({
                message: error.data,
                templateUrl: "NotificationErrorTemplate.html",
                scope: $scope,
                delay: 5e4
            });
        });
    };
} ]);

angular.module("account").controller("NotificationsCtrl", [ "$scope", "MultiTestersLoader", "MultiSupervisorsLoader", "Account", "$modal", "$resource", "AccountLoader", "userInfoService", "$location", "Notification", "notificationService", function($scope, MultiTestersLoader, MultiSupervisorsLoader, Account, $modal, $resource, AccountLoader, userInfoService, $location, Notification, notificationService) {
    $scope.mainNot = {};
    $scope.notificationList = [];
    $scope.selectNotification = function(notification) {
        $scope.mainNot = notification;
    };
    $scope.newNotification = function() {
        $scope.mainNot = {};
    };
    $scope.saveNotification = function(notification) {
        if (notification.id !== undefined) {
            notificationService.updateNotification(notification).then(function(result) {
                if (result.type === "success") {
                    Notification.error({
                        message: result.text,
                        templateUrl: "NotificationSuccessTemplate.html",
                        scope: $scope,
                        delay: 5e4
                    });
                } else {
                    Notification.error({
                        message: result.text,
                        templateUrl: "NotificationErrorTemplate.html",
                        scope: $scope,
                        delay: 5e4
                    });
                }
            }, function(error) {
                Notification.error({
                    message: "Unabled to update a notification.",
                    templateUrl: "NotificationErrorTemplate.html",
                    scope: $scope,
                    delay: 5e4
                });
            });
        } else {
            notificationService.saveNotification(notification).then(function(result) {
                if (result.type === "success") {
                    Notification.error({
                        message: result.text,
                        templateUrl: "NotificationSuccessTemplate.html",
                        scope: $scope,
                        delay: 5e4
                    });
                    $scope.notificationList.unshift(result.data);
                } else {
                    Notification.error({
                        message: result.text,
                        templateUrl: "NotificationErrorTemplate.html",
                        scope: $scope,
                        delay: 5e4
                    });
                }
            }, function(error) {
                Notification.error({
                    message: "Unabled to add a notification.",
                    templateUrl: "NotificationErrorTemplate.html",
                    scope: $scope,
                    delay: 5e4
                });
            });
        }
    };
    $scope.getNotificationList = function() {
        notificationService.getAllNotifications().then(function(result) {
            $scope.notificationList = result;
        }, function(error) {
            Notification.error({
                message: "Unabled to load notifications.",
                templateUrl: "NotificationErrorTemplate.html",
                scope: $scope,
                delay: 5e4
            });
        });
    };
    $scope.getNotificationList();
} ]);

angular.module("account").controller("ConfirmAccountDeleteCtrl", function($scope, $modalInstance, accountToDelete, accountList, Account, Notification) {
    $scope.accountToDelete = accountToDelete;
    $scope.accountList = accountList;
    $scope.delete = function() {
        Account.remove({
            id: accountToDelete.id
        }, function() {
            $modalInstance.close($scope.accountToDelete);
        }, function(error) {
            Notification.error({
                message: error.data,
                templateUrl: "NotificationErrorTemplate.html",
                scope: $scope,
                delay: 5e4
            });
        });
    };
    $scope.cancel = function() {
        $modalInstance.dismiss("cancel");
    };
});

angular.module("account").controller("ForgottenCtrl", [ "$scope", "$resource", "$rootScope", "Notification", function($scope, $resource, $rootScope, Notification) {
    var ForgottenRequest = $resource("api/sooa/accounts/passwordresetrequest");
    $scope.requestResetPassword = function() {
        var resetReq = new ForgottenRequest();
        resetReq.username = $scope.username;
        resetReq.$save(function() {
            if (resetReq.text === "resetRequestProcessed") {
                $scope.username = "";
            }
        }, function(error) {
            Notification.error({
                message: error.data,
                templateUrl: "NotificationErrorTemplate.html",
                scope: $scope,
                delay: 5e4
            });
        });
    };
    $scope.getAppInfo = function() {
        return $rootScope.appInfo;
    };
} ]);

"use strict";

angular.module("account").controller("RegistrationCtrl", [ "$scope", "$resource", "$modal", "$location", "$rootScope", "Notification", function($scope, $resource, $modal, $location, $rootScope, Notification) {
    $scope.account = {};
    $scope.registered = false;
    $scope.agreed = false;
    var Username = $resource("api/sooa/usernames/:username", {
        username: "@username"
    });
    var Email = $resource("api/sooa/emails/:email", {
        email: "@email"
    });
    var NewAccount = $resource("api/sooa/accounts/register");
    $scope.registerAccount = function() {
        if ($scope.agreed) {
            var acctToRegister = new NewAccount();
            acctToRegister.accountType = "tester";
            acctToRegister.employer = $scope.account.employer;
            acctToRegister.fullName = $scope.account.fullName;
            acctToRegister.phone = $scope.account.phone;
            acctToRegister.title = $scope.account.title;
            acctToRegister.juridiction = $scope.account.juridiction;
            acctToRegister.username = $scope.account.username;
            acctToRegister.password = $scope.account.password;
            acctToRegister.email = $scope.account.email;
            acctToRegister.signedConfidentialityAgreement = true;
            acctToRegister.$save(function() {
                if (acctToRegister.text === "userAdded") {
                    $scope.account = {};
                    $scope.registered = true;
                    $location.path("/home");
                    Notification.success({
                        message: $rootScope.appInfo.registrationSubmittedContent,
                        templateUrl: "NotificationSuccessTemplate.html",
                        scope: $rootScope,
                        delay: 3e4
                    });
                } else {
                    $scope.registered = false;
                }
            }, function() {
                $scope.registered = false;
            });
            $scope.registered = true;
        }
    };
    $scope.getAppInfo = function() {
        return $rootScope.appInfo;
    };
} ]);

"use strict";

angular.module("account").controller("RegisterResetPasswordCtrl", [ "$scope", "$resource", "$modal", "$routeParams", "isFirstSetup", "Notification", function($scope, $resource, $modal, $routeParams, isFirstSetup, Notification) {
    $scope.agreed = false;
    $scope.displayForm = true;
    $scope.isFirstSetup = isFirstSetup;
    if (!angular.isDefined($routeParams.username)) {
        $scope.displayForm = false;
    }
    if ($routeParams.username === "") {
        $scope.displayForm = false;
    }
    if (!angular.isDefined($routeParams.token)) {
        $scope.displayForm = false;
    }
    if ($routeParams.token === "") {
        $scope.displayForm = false;
    }
    var AcctResetPassword = $resource("api/sooa/accounts/passwordreset", {
        id: "@userId",
        token: "@token"
    });
    $scope.user = {};
    $scope.user.username = $routeParams.username;
    $scope.user.newUsername = $routeParams.username;
    $scope.user.userId = $routeParams.userId;
    $scope.user.token = $routeParams.token;
    $scope.changePassword = function() {
        if ($scope.agreed) {
            var resetAcctPass = new AcctResetPassword($scope.user);
            resetAcctPass.$save(function() {
                $scope.user.password = "";
                $scope.user.passwordConfirm = "";
            }, function(error) {
                Notification.error({
                    message: error.data,
                    templateUrl: "NotificationErrorTemplate.html",
                    scope: $scope,
                    delay: 5e4
                });
            });
        }
    };
} ]);

angular.module("hit-tool-directives").directive("compile", function($compile) {
    return function(scope, element, attrs) {
        scope.$watch(function(scope) {
            return scope.$eval(attrs.compile);
        }, function(value) {
            element.html(value);
            $compile(element.contents())(scope);
        });
    };
});

angular.module("hit-tool-directives").directive("stRatio", function() {
    return {
        link: function(scope, element, attr) {
            var ratio = +attr.stRatio;
            element.css("width", ratio + "%");
        }
    };
});

angular.module("hit-tool-directives").directive("csSelect", function() {
    return {
        require: "^stTable",
        template: "",
        scope: {
            row: "=csSelect"
        },
        link: function(scope, element, attr, ctrl) {
            element.bind("change", function(evt) {
                scope.$apply(function() {
                    ctrl.select(scope.row, "single");
                });
            });
            scope.$watch("row.isSelected", function(newValue, oldValue) {
                if (newValue === true) {
                    element.parent().addClass("st-selected");
                } else {
                    element.parent().removeClass("st-selected");
                }
            });
        }
    };
});

angular.module("hit-tool-directives").directive("mypopover", function($compile, $templateCache) {
    return {
        restrict: "A",
        link: function(scope, element, attrs) {
            var popOverContent = $templateCache.get("profileInfo.html");
            var options = {
                content: popOverContent,
                placement: "bottom",
                html: true
            };
            $(element).popover(options);
        }
    };
});

angular.module("hit-tool-directives").directive("windowExit", function($window, $templateCache, $http, User) {
    return {
        restrict: "AE",
        compile: function(element, attrs) {
            var myEvent = $window.attachEvent || $window.addEventListener, chkevent = $window.attachEvent ? "onbeforeunload" : "beforeunload";
            myEvent(chkevent, function(e) {
                $templateCache.removeAll();
            });
        }
    };
});

angular.module("hit-tool-directives").directive("msg", [ function() {
    return {
        restrict: "EA",
        replace: true,
        link: function(scope, element, attrs) {
            var key = attrs.key;
            if (attrs.keyExpr) {
                scope.$watch(attrs.keyExpr, function(value) {
                    key = value;
                    element.text($.i18n.prop(value));
                });
            }
            scope.$watch("language()", function(value) {
                element.text($.i18n.prop(key));
            });
        }
    };
} ]);

angular.module("hit-tool-directives").directive("selectMin", function() {
    return {
        restrict: "A",
        require: "ngModel",
        scope: {
            ngMin: "="
        },
        link: function($scope, $element, $attrs, ngModelController) {
            ngModelController.$validators.min = function(value) {
                if (value) {
                    return value >= $scope.ngMin;
                }
                return true;
            };
        }
    };
});

"use strict";

angular.module("account").directive("checkEmail", [ "$resource", function($resource) {
    return {
        restrict: "AC",
        require: "ngModel",
        link: function(scope, element, attrs, ctrl) {
            var Email = $resource("api/sooa/emails/:email", {
                email: "@email"
            });
            var EMAIL_REGEXP = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
            element.on("keyup", function() {
                if (element.val().length !== 0 && EMAIL_REGEXP.test(element.val())) {
                    var emailToCheck = new Email({
                        email: element.val()
                    });
                    emailToCheck.$get(function() {
                        scope.emailUnique = emailToCheck.text === "emailNotFound" ? "valid" : undefined;
                        scope.emailValid = EMAIL_REGEXP.test(element.val()) ? "valid" : undefined;
                        if (scope.emailUnique && scope.emailValid) {
                            ctrl.$setValidity("email", true);
                        } else {
                            ctrl.$setValidity("email", false);
                        }
                    }, function() {});
                } else {
                    scope.emailUnique = undefined;
                    scope.emailValid = undefined;
                    ctrl.$setValidity("email", false);
                }
            });
        }
    };
} ]);

"use strict";

angular.module("account").directive("checkEmployer", [ function() {
    return {
        require: "ngModel",
        link: function(scope, elem, attrs, ctrl) {
            var employer = "#" + attrs.checkEmployer;
            elem.add(employer).on("keyup", function() {
                scope.$apply(function() {
                    var v = elem.val() === $(firstPassword).val();
                    ctrl.$setValidity("noMatch", v);
                });
            });
        }
    };
} ]);

"use strict";

angular.module("account").directive("checkPassword", [ function() {
    return {
        require: "ngModel",
        link: function(scope, elem, attrs, ctrl) {
            var firstPassword = "#" + attrs.checkPassword;
            elem.add(firstPassword).on("keyup", function() {
                scope.$apply(function() {
                    var v = elem.val() === $(firstPassword).val();
                    ctrl.$setValidity("noMatch", v);
                });
            });
        }
    };
} ]);

"use strict";

angular.module("account").directive("checkPhone", [ function() {
    return {
        restrict: "AC",
        require: "ngModel",
        link: function(scope, element, attrs, ctrl) {
            var NUMBER_REGEXP = /[0-9]*/;
            element.on("keyup", function() {
                if (element.val() && element.val() != null && element.val() != "") {
                    scope.phoneIsNumber = NUMBER_REGEXP.test(element.val()) && element.val() > 0 ? "valid" : undefined;
                    scope.phoneValidLength = element.val().length >= 7 ? "valid" : undefined;
                    if (scope.phoneIsNumber && scope.phoneValidLength) {
                        ctrl.$setValidity("phone", true);
                    } else {
                        ctrl.$setValidity("phone", false);
                    }
                } else {
                    scope.phoneIsNumber = undefined;
                    scope.phoneValidLength = undefined;
                    ctrl.$setValidity("phone", true);
                }
            });
        }
    };
} ]);

"use strict";

angular.module("account").directive("checkPoaDate", [ function() {
    return {
        replace: true,
        link: function(scope, elem, attrs, ctrl) {
            var startElem = elem.find("#inputStartDate");
            var endElem = elem.find("#inputEndDate");
            var ctrlStart = startElem.inheritedData().$ngModelController;
            var ctrlEnd = endElem.inheritedData().$ngModelController;
            var checkDates = function() {
                var sDate = new Date(startElem.val());
                var eDate = new Date(endElem.val());
                if (sDate < eDate) {
                    ctrlStart.$setValidity("datesOK", true);
                    ctrlEnd.$setValidity("datesOK", true);
                } else {
                    ctrlStart.$setValidity("datesOK", false);
                    ctrlEnd.$setValidity("datesOK", false);
                }
            };
            startElem.on("change", checkDates);
            endElem.on("change", checkDates);
        }
    };
} ]);

"use strict";

angular.module("account").directive("checkTimerange", [ function() {
    return {
        replace: true,
        link: function(scope, elem, attrs, ctrl) {
            var myElem = elem.children();
            var sh = myElem.find(".shour");
            var sm = myElem.find(".sminute");
            var eh = myElem.find(".ehour");
            var em = myElem.find(".eminute");
            var ctrlSH, ctrlSM, ctrlEH, ctrlEM;
            ctrlSH = sh.inheritedData().$ngModelController;
            ctrlSM = sm.inheritedData().$ngModelController;
            ctrlEH = eh.inheritedData().$ngModelController;
            ctrlEM = em.inheritedData().$ngModelController;
            var newnew = true;
            var checkTimeRange = function() {
                if (newnew) {
                    ctrlSH.$setViewValue(ctrlSH.$modelValue);
                    ctrlSM.$setViewValue(ctrlSM.$modelValue);
                    ctrlEH.$setViewValue(ctrlEH.$modelValue);
                    ctrlEM.$setViewValue(ctrlEM.$modelValue);
                    newnew = false;
                }
                var tmpDate = new Date();
                var startTime = angular.copy(tmpDate);
                var endTime = angular.copy(tmpDate);
                startTime.setHours(sh.val());
                startTime.setMinutes(sm.val());
                endTime.setHours(eh.val());
                endTime.setMinutes(em.val());
                if (startTime < endTime) {
                    ctrlSH.$setValidity("poaOK", true);
                    ctrlSM.$setValidity("poaOK", true);
                    ctrlEH.$setValidity("poaOK", true);
                    ctrlEM.$setValidity("poaOK", true);
                } else {
                    ctrlSH.$setValidity("poaOK", false);
                    ctrlSM.$setValidity("poaOK", false);
                    ctrlEH.$setValidity("poaOK", false);
                    ctrlEM.$setValidity("poaOK", false);
                }
            };
            sh.on("change", checkTimeRange);
            sm.on("change", checkTimeRange);
            eh.on("change", checkTimeRange);
            em.on("change", checkTimeRange);
        }
    };
} ]);

"use strict";

angular.module("account").directive("checkUsername", [ "$resource", function($resource) {
    return {
        restrict: "AC",
        require: "ngModel",
        link: function(scope, element, attrs, ctrl) {
            var Username = $resource("api/sooa/usernames/:username", {
                username: "@username"
            });
            element.on("keyup", function() {
                if (element.val().length >= 4) {
                    var usernameToCheck = new Username({
                        username: element.val()
                    });
                    usernameToCheck.$get(function() {
                        scope.usernameValidLength = element.val() && element.val().length >= 4 && element.val().length <= 20 ? "valid" : undefined;
                        scope.usernameUnique = usernameToCheck.text === "usernameNotFound" ? "valid" : undefined;
                        if (scope.usernameValidLength && scope.usernameUnique) {
                            ctrl.$setValidity("username", true);
                        } else {
                            ctrl.$setValidity("username", false);
                        }
                    }, function() {});
                } else {
                    scope.usernameValidLength = undefined;
                    scope.usernameUnique = undefined;
                    ctrl.$setValidity("username", false);
                }
            });
        }
    };
} ]);

"use strict";

angular.module("account").directive("passwordValidate", [ function() {
    return {
        require: "ngModel",
        link: function(scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function(viewValue) {
                scope.pwdValidLength = viewValue && viewValue.length >= 7 ? "valid" : undefined;
                scope.pwdHasLowerCaseLetter = viewValue && /[a-z]/.test(viewValue) ? "valid" : undefined;
                scope.pwdHasUpperCaseLetter = viewValue && /[A-Z]/.test(viewValue) ? "valid" : undefined;
                scope.pwdHasNumber = viewValue && /\d/.test(viewValue) ? "valid" : undefined;
                if (scope.pwdValidLength && scope.pwdHasLowerCaseLetter && scope.pwdHasUpperCaseLetter && scope.pwdHasNumber) {
                    ctrl.$setValidity("pwd", true);
                    return viewValue;
                } else {
                    ctrl.$setValidity("pwd", false);
                    return undefined;
                }
            });
        }
    };
} ]);

"use strict";

angular.module("logs").controller("LogCtrl", [ "$scope", "ValidationLogService", "TransportLogService", "$rootScope", "$timeout", function($scope, ValidationLogService, TransportLogService, $rootScope, $timeout) {
    $scope.numberOfValidationLogs = 0;
    $scope.numberOfTransportLogs = 0;
    $scope.error = null;
    $scope.loadingAll = false;
    $scope.loadingOne = false;
    $scope.currentDate = new Date();
    $scope.selectedType = null;
    $scope.initLogs = function() {
        $scope.loadingAll = true;
        $scope.numberOfValidationLogs = 0;
        $timeout(function() {
            ValidationLogService.getTotalCount($rootScope.domain.domain).then(function(numberOfValidationLogs) {
                $scope.numberOfValidationLogs = numberOfValidationLogs;
                $scope.loadingAll = false;
            }, function(error) {
                $scope.loadingAll = false;
                $scope.error = "Sorry, Cannot load the logs. Please try again. \n DEBUG:" + error;
            });
            $scope.numberOfTransportLogs = 0;
            TransportLogService.getTotalCount($rootScope.domain.domain).then(function(numberOfTransportLogs) {
                $scope.numberOfTransportLogs = numberOfTransportLogs;
                $scope.loadingAll = false;
            }, function(error) {
                $scope.loadingAll = false;
                $scope.error = "Sorry, Cannot load the logs. Please try again. \n DEBUG:" + error;
            });
        }, 1e3);
        $rootScope.$on("logs:decreaseValidationCount", function(event) {
            $scope.numberOfValidationLogs -= 1;
        });
        $rootScope.$on("logs:decreaseTransportCount", function(event) {
            $scope.numberOfTransportLogs -= 1;
        });
    };
    $scope.selectType = function(type) {
        $scope.selectedType = type;
    };
} ]);

angular.module("logs").controller("ValidationLogCtrl", [ "$scope", "ValidationLogService", "Notification", "$modal", "$rootScope", "$timeout", function($scope, ValidationLogService, Notification, $modal, $rootScope, $timeout) {
    $scope.logs = null;
    $scope.tmpLogs = null;
    $scope.logDetails = null;
    $scope.error = null;
    $scope.loadingAll = false;
    $scope.loadingOne = false;
    $scope.allLogs = null;
    $scope.contextType = "*";
    $scope.userType = "*";
    $scope.resultType = "*";
    $scope.initValidationLogs = function() {
        $scope.loadingAll = true;
        $timeout(function() {
            ValidationLogService.getAll($rootScope.domain.domain).then(function(logs) {
                $scope.allLogs = logs;
                $scope.contextType = "*";
                $scope.userType = "*";
                $scope.resultType = "*";
                $scope.filterBy();
                $scope.loadingAll = false;
            }, function(error) {
                $scope.loadingAll = false;
                $scope.error = "Sorry, Cannot load the logs. Please try again. \n DEBUG:" + error;
            });
        }, 1e3);
    };
    $scope.openLogDetails = function(validationLogItem) {
        var modalInstance = $modal.open({
            templateUrl: "ValidationLogDetails.html",
            controller: "ValidationLogDetailsCtrl",
            windowClass: "valueset-modal",
            animation: false,
            keyboard: true,
            backdrop: true,
            resolve: {
                validationLogItem: function() {
                    return validationLogItem;
                }
            }
        });
    };
    $scope.filterBy = function() {
        $scope.logs = $scope.filterByResultType($scope.filterByUserType($scope.filterByContextType($scope.allLogs)));
        $scope.tmpLogs = [].concat($scope.logs);
    };
    $scope.filterByContextType = function(inputLogs) {
        return _.filter(inputLogs, function(log) {
            return $scope.contextType === "*" || $scope.contextType === log.testingStage;
        });
    };
    $scope.filterByUserType = function(inputLogs) {
        return _.filter(inputLogs, function(log) {
            return $scope.userType === "*" || $scope.userType === "AUTH" && log.userFullname.indexOf("Guest-") === -1 || $scope.userType === "NOT_AUTH" && log.userFullname.indexOf("Guest-") !== -1;
        });
    };
    $scope.filterByResultType = function(inputLogs) {
        return _.filter(inputLogs, function(log) {
            return $scope.resultType === "*" || $scope.resultType === "SUCCESS" && log.validationResult || $scope.resultType === "FAILED" && !log.validationResult;
        });
    };
    $scope.deleteLog = function(log) {
        ValidationLogService.deleteLog(log.id).then(function(result) {
            $rootScope.$emit("logs:decreaseValidationCount");
            var index = $scope.logs.indexOf(log);
            if (index > -1) {
                $scope.logs.splice(index, 1);
            }
        }, function(error) {
            $scope.error = "Sorry, Cannot delete the log. Please try again. \n DEBUG:" + error;
        });
    };
} ]);

angular.module("logs").controller("TransportLogCtrl", [ "$scope", "TransportLogService", "Notification", "$modal", "$rootScope", "$timeout", function($scope, TransportLogService, Notification, $modal, $rootScope, $timeout) {
    $scope.logs = null;
    $scope.tmpLogs = null;
    $scope.logDetails = null;
    $scope.error = null;
    $scope.loadingAll = false;
    $scope.loadingOne = false;
    $scope.allLogs = null;
    $scope.selected = {};
    $scope.selected.transportType = "*";
    $scope.selected.protocol = "*";
    $scope.userType = "*";
    $scope.transportTypes = [];
    $scope.protocols = [];
    $scope.initTransportLogs = function() {
        $scope.loadingAll = true;
        $timeout(function() {
            TransportLogService.getAll($rootScope.domain.domain).then(function(logs) {
                $scope.allLogs = logs;
                $scope.selected.transportType = "*";
                $scope.selected.protocol = "*";
                $scope.userType = "*";
                $scope.protocols = _(logs).chain().flatten().pluck("protocol").unique().value();
                $scope.transportTypes = _(logs).chain().flatten().pluck("testingType").unique().value();
                $scope.filterBy();
                $scope.loadingAll = false;
            }, function(error) {
                $scope.loadingAll = false;
                $scope.error = "Sorry, Cannot load the logs. Please try again. \n DEBUG:" + error;
            });
        }, 1e3);
    };
    $scope.openLogDetails = function(transportLogItem) {
        var modalInstance = $modal.open({
            templateUrl: "TransportLogDetails.html",
            controller: "TransportLogDetailsCtrl",
            windowClass: "valueset-modal",
            animation: false,
            keyboard: true,
            backdrop: true,
            resolve: {
                transportLogItem: function() {
                    return transportLogItem;
                }
            }
        });
    };
    $scope.filterBy = function() {
        $scope.logs = $scope.filterByProtocol($scope.filterByTransportType($scope.filterByUserType($scope.allLogs)));
        $scope.tmpLogs = [].concat($scope.logs);
    };
    $scope.filterByUserType = function(inputLogs) {
        return _.filter(inputLogs, function(log) {
            return $scope.userType === "*" || $scope.userType === "AUTH" && log.userFullname.indexOf("Guest-") === -1 || $scope.userType === "NOT_AUTH" && log.userFullname.indexOf("Guest-") !== -1;
        });
    };
    $scope.filterByProtocol = function(inputLogs) {
        return _.filter(inputLogs, function(log) {
            return $scope.selected.protocol === "*" || $scope.selected.protocol === log.protocol;
        });
    };
    $scope.filterByTransportType = function(inputLogs) {
        return _.filter(inputLogs, function(log) {
            return $scope.selected.transportType === "*" || $scope.selected.transportType === log.testingType;
        });
    };
    $scope.getTransportTypeIcon = function(connType) {
        return connType === "TA_MANUAL" || connType === "SUT_MANUAL" ? "fa fa-wrench" : connType === "SUT_RESPONDER" || connType === "SUT_INITIATOR" ? "fa fa-arrow-right" : connType === "TA_RESPONDER" || connType === "TA_INITIATOR" ? "fa fa-arrow-left" : "fa fa-check-square-o";
    };
    $scope.deleteLog = function(log) {
        TransportLogService.deleteLog(log.id).then(function(result) {
            $rootScope.$emit("logs:decreaseTransportCount");
            var index = $scope.logs.indexOf(log);
            if (index > -1) {
                $scope.logs.splice(index, 1);
            }
        }, function(error) {
            $scope.error = "Sorry, Cannot delete the log. Please try again. \n DEBUG:" + error;
        });
    };
} ]);

angular.module("logs").controller("TransportLogDetailsCtrl", function($scope, $modalInstance, transportLogItem) {
    $scope.transportLogItem = transportLogItem;
    $scope.close = function() {
        $modalInstance.dismiss("cancel");
    };
});

angular.module("logs").controller("ValidationLogDetailsCtrl", function($scope, $modalInstance, validationLogItem) {
    $scope.validationLogItem = validationLogItem;
    $scope.segmentErrors = [];
    Object.keys($scope.validationLogItem.errorCountInSegment).forEach(function(segment) {
        $scope.segmentErrors.push({
            segment: segment,
            errorCount: $scope.validationLogItem.errorCountInSegment[segment]
        });
    });
    $scope.tmpSegmentErrors = [].concat($scope.segmentErrors);
    $scope.close = function() {
        $modalInstance.dismiss("cancel");
    };
});

angular.module("doc").directive("apiDocs", [ function() {
    return {
        restrict: "A",
        templateUrl: "ApiDocs.html",
        replace: false,
        controller: "ApiDocsCtrl"
    };
} ]);

angular.module("doc").directive("testcaseDoc", [ function() {
    return {
        restrict: "A",
        templateUrl: "TestCaseDoc.html",
        replace: false,
        controller: "TestCaseDocumentationCtrl"
    };
} ]);

angular.module("doc").directive("knownIssues", [ function() {
    return {
        restrict: "A",
        templateUrl: "KnownIssues.html",
        replace: false,
        controller: "KnownIssuesCtrl"
    };
} ]);

angular.module("doc").directive("releaseNotes", [ function() {
    return {
        restrict: "A",
        templateUrl: "ReleaseNotes.html",
        replace: false,
        controller: "ReleaseNotesCtrl"
    };
} ]);

angular.module("doc").directive("userDocs", [ function() {
    return {
        restrict: "A",
        templateUrl: "UserDocs.html",
        replace: false,
        controller: "UserDocsCtrl"
    };
} ]);

angular.module("doc").directive("installationGuide", [ function() {
    return {
        restrict: "A",
        templateUrl: "InstallationGuide.html",
        replace: false,
        controller: "InstallationGuideCtrl"
    };
} ]);

angular.module("doc").directive("toolDownloads", [ function() {
    return {
        restrict: "A",
        templateUrl: "ToolDownloadList.html",
        replace: false,
        controller: "ToolDownloadListCtrl"
    };
} ]);

angular.module("doc").controller("DocumentationCtrl", function($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, userInfoService, StorageService) {
    $scope.status = {
        userDoc: true
    };
    $scope.scrollbarWidth = $rootScope.getScrollbarWidth();
    $scope.selectedScope = {
        key: "USER"
    };
    $scope.sectionType = {
        key: "app"
    };
    $scope.documentsScopes = [];
    $scope.allDocumentsScopes = [ {
        key: "USER",
        name: "Private"
    }, {
        key: "GLOBAL",
        name: "Public"
    } ];
    $scope.downloadDocument = function(path) {
        if (path != null) {
            var form = document.createElement("form");
            form.action = "api/documentation/downloadDocument";
            form.method = "POST";
            form.target = "_target";
            var input = document.createElement("input");
            input.name = "path";
            input.value = path;
            form.appendChild(input);
            form.style.display = "none";
            document.body.appendChild(form);
            form.submit();
        }
    };
    $scope.initDocumentation = function() {
        $scope.selectSectionType($rootScope.domain);
    };
    $scope.selectScope = function() {
        $scope.error = null;
        if ($scope.selectedScope.key && $scope.selectedScope.key !== null && $scope.selectedScope.key !== "") {
            StorageService.set("DOC_MANAGE_SELECTED_SCOPE_KEY", $scope.selectedScope.key);
            $scope.$broadcast("event:doc:scopeChangedEvent", $scope.selectedScope.key, $scope.sectionType.key);
        }
    };
    $scope.selectSectionType = function(sectionType) {
        $scope.sectionType.key = sectionType;
        $scope.documentsScopes = [ $scope.allDocumentsScopes[1] ];
        if ($rootScope.isDocumentationManagementSupported() && userInfoService.isAuthenticated()) {
            if ($scope.sectionType.key == "app" && userInfoService.isAdmin() || $rootScope.hasWriteAccess()) {
                $scope.documentsScopes = $scope.allDocumentsScopes;
            }
        } else {
            $scope.documentsScopes = [ $scope.allDocumentsScopes[1] ];
        }
        $scope.selectedScope.key = $scope.documentsScopes[0].key;
        $scope.selectScope();
    };
});

angular.module("doc").controller("UserDocsCtrl", function($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, DocumentationManager, StorageService, $modal, Notification, userInfoService) {
    $scope.docs = [];
    $scope.loading = true;
    $scope.error = null;
    $scope.scrollbarWidth = $rootScope.getScrollbarWidth();
    $scope.scope = null;
    $scope.actionError = null;
    $scope.type = "USERDOC";
    $scope.sectionType = $rootScope.domain;
    $scope.loadDocs = function(scope, domain) {
        $scope.loading = true;
        if (scope === null || scope === undefined) {
            scope = StorageService.get("DOC_MANAGE_SELECTED_SCOPE_KEY");
            scope = scope && scope != null ? scope : "GLOBAL";
        }
        $scope.scope = scope;
        DocumentationManager.getDocuments(domain, scope, $scope.type).then(function(result) {
            $scope.loading = false;
            $scope.docs = result;
        }, function(error) {
            $scope.loading = false;
            $scope.error = null;
            $scope.docs = [];
        });
    };
    $scope.initDocs = function(scope, wait) {
        if ($scope.sectionType !== "app") {
            $scope.initDomainDocs(scope, wait);
        } else {
            $scope.initAppDocs(scope, wait);
        }
    };
    $scope.initDomainDocs = function(scope, wait) {
        $timeout(function() {
            if ($rootScope.domain != null) {
                $scope.loadDocs(scope, $rootScope.domain.domain, wait);
            }
        }, wait);
    };
    $scope.initAppDocs = function(scope, wait) {
        $timeout(function() {
            $scope.loadDocs(scope, "app", wait);
        }, wait);
    };
    $scope.isLink = function(path) {
        return path && path != null && path.startsWith("http");
    };
    $scope.downloadDocument = function(path) {
        if (path != null) {
            var form = document.createElement("form");
            form.action = "api/documentation/downloadDocument";
            form.method = "POST";
            form.target = "_target";
            var input = document.createElement("input");
            input.name = "path";
            input.value = path;
            form.appendChild(input);
            form.style.display = "none";
            document.body.appendChild(form);
            form.submit();
        }
    };
    $scope.gotToDoc = function(path) {
        if (path != null) {
            var form = document.createElement("form");
            form.action = "api/documentation/downloadDocument";
            form.method = "POST";
            form.target = "_target";
            var input = document.createElement("input");
            input.name = "path";
            input.value = path;
            form.appendChild(input);
            form.style.display = "none";
            document.body.appendChild(form);
            form.submit();
        }
    };
    $scope.initDocs(null, 3e3);
    $scope.$on("event:doc:scopeChangedEvent", function(event, scope, sectionType) {
        $scope.sectionType = sectionType;
        $scope.initDocs(scope, 500);
    });
    $scope.addDocument = function() {
        $scope.actionError = null;
        var modalInstance = $modal.open({
            templateUrl: "views/documentation/edit-document.html",
            controller: "CreateOrEditDocumentCtrl",
            windowClass: "documentation-upload-modal",
            backdrop: "static",
            keyboard: false,
            backdropClick: false,
            resolve: {
                totalNumber: function() {
                    return $scope.docs.length + 1;
                },
                document: function() {
                    var document = {};
                    document.position = $scope.docs.length + 1;
                    document.type = $scope.type;
                    document.scope = $scope.scope;
                    document.domain = $scope.sectionType !== "app" ? $rootScope.domain.domain : $scope.sectionType;
                    return document;
                },
                accept: function() {
                    return ".pdf,.html,.doc,.docx,.pptx,.ppt";
                }
            }
        });
        modalInstance.result.then(function(document) {
            if (document && document != null) {
                Notification.success({
                    message: "Document added successfully !",
                    templateUrl: "NotificationSuccessTemplate.html",
                    scope: $rootScope,
                    delay: 5e3
                });
                $scope.initDocs($scope.scope, 100);
            }
        });
    };
    $scope.editDocument = function(document) {
        $scope.actionError = null;
        var modalInstance = $modal.open({
            templateUrl: "views/documentation/edit-document.html",
            controller: "CreateOrEditDocumentCtrl",
            windowClass: "documentation-upload-modal",
            backdrop: "static",
            keyboard: false,
            backdropClick: false,
            resolve: {
                totalNumber: function() {
                    return $scope.docs.length + 1;
                },
                document: function() {
                    return angular.copy(document);
                },
                accept: function() {
                    return ".pdf,.html,.doc,.docx,.pptx,.ppt";
                }
            }
        });
        modalInstance.result.then(function(document) {
            if (document && document != null) {
                Notification.success({
                    message: "Document saved successfully !",
                    templateUrl: "NotificationSuccessTemplate.html",
                    scope: $rootScope,
                    delay: 5e3
                });
                $scope.initDocs($scope.scope, 100);
            }
        });
    };
    $scope.deleteDocument = function(document) {
        $scope.actionError = null;
        var modalInstance = $modal.open({
            templateUrl: "views/documentation/confirm-delete.html",
            controller: "ConfirmDialogCtrl",
            size: "md",
            backdrop: "static",
            keyboard: false
        });
        modalInstance.result.then(function(result) {
            if (result) {
                DocumentationManager.deleteDocument(document.id).then(function(result) {
                    Notification.success({
                        message: "Document deleted successfully !",
                        templateUrl: "NotificationSuccessTemplate.html",
                        scope: $rootScope,
                        delay: 5e3
                    });
                    $scope.initDocs($scope.scope, 100);
                }, function(error) {
                    $scope.actionError = "Sorry, Cannot delete the document. Please try again. \n DEBUG:" + error;
                });
            }
        });
    };
    $scope.publishDocument = function(document) {
        $scope.actionError = null;
        var modalInstance = $modal.open({
            templateUrl: "views/documentation/confirm-publish.html",
            controller: "ConfirmDialogCtrl",
            size: "md",
            backdrop: "static",
            keyboard: false
        });
        modalInstance.result.then(function(result) {
            if (result) {
                DocumentationManager.publishDocument(document.id).then(function(result) {
                    Notification.success({
                        message: "Document published successfully !",
                        templateUrl: "NotificationSuccessTemplate.html",
                        scope: $rootScope,
                        delay: 5e3
                    });
                    $scope.initDocs($scope.scope, 100);
                }, function(error) {
                    $scope.actionError = "Sorry, Cannot delete the document. Please try again. \n DEBUG:" + error;
                });
            }
        });
    };
});

angular.module("doc").controller("CreateOrEditDocumentCtrl", function($scope, $modalInstance, DocumentationManager, FileUploader, totalNumber, document, accept) {
    $scope.error = null;
    $scope.loading = false;
    $scope.hasUrl = false;
    $scope.totalNumber = totalNumber;
    $scope.document = document;
    $scope.uploadedPath = null;
    $scope.accept = accept;
    if ($scope.document.path && $scope.document.path.startsWith("http")) {
        $scope.hasUrl = true;
    } else {
        $scope.uploadedPath = $scope.document.path;
        $scope.document.path = "";
    }
    $scope.positions = function() {
        var array = new Array($scope.totalNumber);
        for (var index = 0; index < array.length; index++) {
            array[index] = index + 1;
        }
        return array;
    };
    FileUploader.FileSelect.prototype.isEmptyAfterSelection = function() {
        return true;
    };
    var documentUploader = $scope.documentUploader = new FileUploader({
        url: "api/documentation/uploadDocument",
        autoUpload: true
    });
    documentUploader.onBeforeUploadItem = function(fileItem) {
        $scope.error = null;
        $scope.uploadedPath = null;
        $scope.loading = true;
        fileItem.formData.push({
            domain: $scope.document.domain,
            type: $scope.document.type
        });
    };
    documentUploader.onCompleteItem = function(fileItem, response, status, headers) {
        $scope.loading = false;
        $scope.error = null;
        $scope.uploadedPath = null;
        if (response.success == false) {
            $scope.error = "Could not upload and process your file.<br>" + response.message;
        } else {
            $scope.uploadedPath = response.path;
        }
    };
    $scope.noFileFound = function() {
        return !$scope.hasUrl && ($scope.uploadedPath === null || $scope.uploadedPath === "");
    };
    $scope.submit = function() {
        if ($scope.document.title != null && $scope.document.title != "") {
            $scope.error = null;
            $scope.loading = true;
            if (!$scope.hasUrl && $scope.uploadedPath !== null && $scope.uploadedPath !== "") {
                $scope.document.path = $scope.uploadedPath;
                $scope.document.name = $scope.uploadedPath.split("\\").pop().split("/").pop();
            }
            DocumentationManager.saveDocument($scope.document).then(function(result) {
                $scope.loading = false;
                $modalInstance.close(result);
            }, function(error) {
                $scope.loading = false;
                $scope.error = error;
            });
        }
    };
    $scope.cancel = function() {
        $modalInstance.dismiss("cancel");
    };
});

angular.module("doc").controller("ReleaseNotesCtrl", function($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, DocumentationManager, StorageService, $modal, Notification) {
    $scope.docs = [];
    $scope.loading = false;
    $scope.error = null;
    $scope.scrollbarWidth = $rootScope.getScrollbarWidth();
    $scope.type = "RELEASENOTE";
    $scope.sectionType = $rootScope.domain;
    $scope.scope = null;
    $scope.loadDocs = function(scope, domain) {
        $scope.loading = true;
        if ($rootScope.domain != null) {
            if (scope === null || scope === undefined) {
                scope = StorageService.get("DOC_MANAGE_SELECTED_SCOPE_KEY");
                scope = scope && scope != null ? scope : "GLOBAL";
            }
            $scope.scope = scope;
            DocumentationManager.getDocuments(domain, scope, $scope.type).then(function(result) {
                $scope.loading = false;
                $scope.docs = result;
            }, function(error) {
                $scope.loading = false;
                $scope.error = null;
                $scope.docs = [];
            });
        }
    };
    $scope.initDocs = function(scope, wait) {
        if ($scope.sectionType !== "app") {
            $scope.initDomainDocs(scope, wait);
        } else {
            $scope.initAppDocs(scope, wait);
        }
    };
    $scope.initDomainDocs = function(scope, wait) {
        $timeout(function() {
            if ($rootScope.domain != null) {
                $scope.loadDocs(scope, $rootScope.domain.domain, wait);
            }
        }, wait);
    };
    $scope.initAppDocs = function(scope, wait) {
        $timeout(function() {
            $scope.loadDocs(scope, "app", wait);
        }, wait);
    };
    $scope.downloadDocument = function(path) {
        if (path != null) {
            var form = document.createElement("form");
            form.action = "api/documentation/downloadDocument";
            form.method = "POST";
            form.target = "_target";
            var input = document.createElement("input");
            input.name = "path";
            input.value = path;
            form.appendChild(input);
            form.style.display = "none";
            document.body.appendChild(form);
            form.submit();
        }
    };
    $scope.initDocs(null, 3e3);
    $scope.$on("event:doc:scopeChangedEvent", function(event, scope, sectionType) {
        $scope.sectionType = sectionType;
        $scope.initDocs(scope, 500);
    });
    $scope.addDocument = function() {
        $scope.actionError = null;
        var modalInstance = $modal.open({
            templateUrl: "views/documentation/edit-document.html",
            controller: "CreateOrEditDocumentCtrl",
            windowClass: "documentation-upload-modal",
            backdrop: "static",
            keyboard: false,
            backdropClick: false,
            resolve: {
                totalNumber: function() {
                    return $scope.docs.length + 1;
                },
                document: function() {
                    var document = {};
                    document.position = $scope.docs.length + 1;
                    document.type = $scope.type;
                    document.scope = $scope.scope;
                    document.domain = $scope.sectionType !== "app" ? $rootScope.domain.domain : $scope.sectionType;
                    return document;
                },
                accept: function() {
                    return ".pdf,.doc,.docx";
                }
            }
        });
        modalInstance.result.then(function(document) {
            if (document && document != null) {
                Notification.success({
                    message: "Document added successfully !",
                    templateUrl: "NotificationSuccessTemplate.html",
                    scope: $rootScope,
                    delay: 5e3
                });
                $scope.initDocs($scope.scope, 100);
            }
        });
    };
    $scope.editDocument = function(document) {
        $scope.actionError = null;
        var modalInstance = $modal.open({
            templateUrl: "views/documentation/edit-document.html",
            controller: "CreateOrEditDocumentCtrl",
            windowClass: "documentation-upload-modal",
            backdrop: "static",
            keyboard: false,
            backdropClick: false,
            resolve: {
                totalNumber: function() {
                    return $scope.docs.length + 1;
                },
                document: function() {
                    return angular.copy(document);
                },
                accept: function() {
                    return ".pdf,.doc,.docx";
                }
            }
        });
        modalInstance.result.then(function(document) {
            if (document && document != null) {
                Notification.success({
                    message: "Document saved successfully !",
                    templateUrl: "NotificationSuccessTemplate.html",
                    scope: $rootScope,
                    delay: 5e3
                });
                $scope.initDocs($scope.scope, 100);
            }
        });
    };
    $scope.deleteDocument = function(document) {
        $scope.actionError = null;
        var modalInstance = $modal.open({
            templateUrl: "views/documentation/confirm-delete.html",
            controller: "ConfirmDialogCtrl",
            size: "md",
            backdrop: "static",
            keyboard: false
        });
        modalInstance.result.then(function(result) {
            if (result) {
                DocumentationManager.deleteDocument(document.id).then(function(result) {
                    Notification.success({
                        message: "Document deleted successfully !",
                        templateUrl: "NotificationSuccessTemplate.html",
                        scope: $rootScope,
                        delay: 5e3
                    });
                    $scope.initDocs($scope.scope, 100);
                }, function(error) {
                    $scope.actionError = "Sorry, Cannot delete the document. Please try again. \n DEBUG:" + error;
                });
            }
        });
    };
    $scope.publishDocument = function(document) {
        $scope.actionError = null;
        var modalInstance = $modal.open({
            templateUrl: "views/documentation/confirm-publish.html",
            controller: "ConfirmDialogCtrl",
            size: "md",
            backdrop: "static",
            keyboard: false
        });
        modalInstance.result.then(function(result) {
            if (result) {
                DocumentationManager.publishDocument(document.id).then(function(result) {
                    Notification.success({
                        message: "Document published successfully !",
                        templateUrl: "NotificationSuccessTemplate.html",
                        scope: $rootScope,
                        delay: 5e3
                    });
                    $scope.initDocs($scope.scope, 100);
                }, function(error) {
                    $scope.actionError = "Sorry, Cannot publish the document. Please try again. \n DEBUG:" + error;
                });
            }
        });
    };
});

angular.module("doc").controller("KnownIssuesCtrl", function($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, DocumentationManager, StorageService, $modal, Notification) {
    $scope.docs = [];
    $scope.loading = false;
    $scope.error = null;
    $scope.type = "KNOWNISSUE";
    $scope.scope = null;
    $scope.sectionType = $rootScope.domain;
    $scope.downloadDocument = function(path) {
        if (path != null) {
            var form = document.createElement("form");
            form.action = "api/documentation/downloadDocument";
            form.method = "POST";
            form.target = "_target";
            var input = document.createElement("input");
            input.name = "path";
            input.value = path;
            form.appendChild(input);
            form.style.display = "none";
            document.body.appendChild(form);
            form.submit();
        }
    };
    $scope.loadDocs = function(scope, domain) {
        if (domain != null) {
            $scope.loading = true;
            if (scope === null || scope === undefined) {
                scope = StorageService.get("DOC_MANAGE_SELECTED_SCOPE_KEY");
                scope = scope && scope != null ? scope : "GLOBAL";
            }
            $scope.scope = scope;
            DocumentationManager.getDocuments(domain, scope, $scope.type).then(function(result) {
                $scope.loading = false;
                $scope.docs = result;
            }, function(error) {
                $scope.loading = false;
                $scope.error = null;
                $scope.docs = [];
            });
        }
    };
    $scope.initDocs = function(scope, wait) {
        if ($scope.sectionType !== "app") {
            $scope.initDomainDocs(scope, wait);
        } else {
            $scope.initAppDocs(scope, wait);
        }
    };
    $scope.initDomainDocs = function(scope, wait) {
        $timeout(function() {
            if ($rootScope.domain != null) {
                $scope.loadDocs(scope, $rootScope.domain.domain, wait);
            }
        }, wait);
    };
    $scope.initAppDocs = function(scope, wait) {
        $timeout(function() {
            $scope.loadDocs(scope, "app", wait);
        }, wait);
    };
    $scope.initDocs(null, 3e3);
    $scope.$on("event:doc:scopeChangedEvent", function(event, scope, sectionType) {
        $scope.sectionType = sectionType;
        $scope.initDocs(scope, 500);
    });
    $scope.addDocument = function() {
        $scope.actionError = null;
        var modalInstance = $modal.open({
            templateUrl: "views/documentation/edit-document.html",
            controller: "CreateOrEditDocumentCtrl",
            windowClass: "documentation-upload-modal",
            backdrop: "static",
            keyboard: false,
            backdropClick: false,
            resolve: {
                totalNumber: function() {
                    return $scope.docs.length + 1;
                },
                document: function() {
                    var document = {};
                    document.position = $scope.docs.length + 1;
                    document.type = $scope.type;
                    document.scope = $scope.scope;
                    document.domain = $scope.sectionType !== "app" ? $rootScope.domain.domain : $scope.sectionType;
                    return document;
                },
                accept: function() {
                    return ".pdf,.doc,.docx";
                }
            }
        });
        modalInstance.result.then(function(document) {
            if (document && document != null) {
                Notification.success({
                    message: "Document added successfully !",
                    templateUrl: "NotificationSuccessTemplate.html",
                    scope: $rootScope,
                    delay: 5e3
                });
                $scope.initDocs($scope.scope, 100);
            }
        });
    };
    $scope.editDocument = function(document) {
        $scope.actionError = null;
        var modalInstance = $modal.open({
            templateUrl: "views/documentation/edit-document.html",
            controller: "CreateOrEditDocumentCtrl",
            windowClass: "documentation-upload-modal",
            backdrop: "static",
            keyboard: false,
            backdropClick: false,
            resolve: {
                totalNumber: function() {
                    return $scope.docs.length + 1;
                },
                document: function() {
                    return angular.copy(document);
                },
                accept: function() {
                    return ".pdf,.doc,.docx";
                }
            }
        });
        modalInstance.result.then(function(document) {
            if (document && document != null) {
                Notification.success({
                    message: "Document saved successfully !",
                    templateUrl: "NotificationSuccessTemplate.html",
                    scope: $rootScope,
                    delay: 5e3
                });
                $scope.initDocs($scope.scope, 100);
            }
        });
    };
    $scope.deleteDocument = function(document) {
        $scope.actionError = null;
        var modalInstance = $modal.open({
            templateUrl: "views/documentation/confirm-delete.html",
            controller: "ConfirmDialogCtrl",
            size: "md",
            backdrop: "static",
            keyboard: false
        });
        modalInstance.result.then(function(result) {
            if (result) {
                DocumentationManager.deleteDocument(document.id).then(function(result) {
                    Notification.success({
                        message: "Document deleted successfully !",
                        templateUrl: "NotificationSuccessTemplate.html",
                        scope: $rootScope,
                        delay: 5e3
                    });
                    $scope.initDocs($scope.scope, 100);
                }, function(error) {
                    $scope.actionError = "Sorry, Cannot delete the document. Please try again. \n DEBUG:" + error;
                });
            }
        });
    };
    $scope.publishDocument = function(document) {
        $scope.actionError = null;
        var modalInstance = $modal.open({
            templateUrl: "views/documentation/confirm-publish.html",
            controller: "ConfirmDialogCtrl",
            size: "md",
            backdrop: "static",
            keyboard: false
        });
        modalInstance.result.then(function(result) {
            if (result) {
                DocumentationManager.publishDocument(document.id).then(function(result) {
                    Notification.success({
                        message: "Document published successfully !",
                        templateUrl: "NotificationSuccessTemplate.html",
                        scope: $rootScope,
                        delay: 5e3
                    });
                    $scope.initDocs($scope.scope, 100);
                }, function(error) {
                    $scope.actionError = "Sorry, Cannot publish the document. Please try again. \n DEBUG:" + error;
                });
            }
        });
    };
});

angular.module("doc").controller("ToolDownloadListCtrl", function($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, DocumentationManager, StorageService, $modal, Notification) {
    $scope.loading = false;
    $scope.error = null;
    $scope.scrollbarWidth = $rootScope.getScrollbarWidth();
    $scope.loading = true;
    $scope.type = "DELIVERABLE";
    $scope.scope = null;
    $scope.actionError = null;
    $scope.docs = [];
    $scope.canEdit = false;
    $scope.sectionType = $rootScope.domain;
    $scope.loadDocs = function(scope, domain) {
        if (domain != null) {
            $scope.loading = true;
            if (scope === null || scope === undefined) {
                scope = StorageService.get("DOC_MANAGE_SELECTED_SCOPE_KEY");
                scope = scope && scope != null ? scope : "GLOBAL";
            }
            $scope.scope = scope;
            DocumentationManager.getDocuments(domain, scope, $scope.type).then(function(result) {
                $scope.error = null;
                $scope.docs = result;
                $scope.loading = false;
            }, function(error) {
                $scope.loading = false;
                $scope.error = "Sorry, failed to load the files";
                $scope.data = [];
            });
        }
    };
    $scope.initDocs = function(scope, wait) {
        if ($scope.sectionType !== "app") {
            $scope.initDomainDocs(scope, wait);
        } else {
            $scope.initAppDocs(scope, wait);
        }
    };
    $scope.initDomainDocs = function(scope, wait) {
        $timeout(function() {
            if ($rootScope.domain != null) {
                $scope.loadDocs(scope, $rootScope.domain.domain, wait);
            }
        }, wait);
    };
    $scope.initAppDocs = function(scope, wait) {
        $timeout(function() {
            $scope.loadDocs(scope, "app", wait);
        }, wait);
    };
    $scope.initDocs(null, 3e3);
    $scope.isLink = function(path) {
        return path && path != null && path.startsWith("http");
    };
    $scope.downloadTool = function(path) {
        if (path != null) {
            var form = document.createElement("form");
            form.action = "api/documentation/downloadDocument";
            form.method = "POST";
            form.target = "_target";
            var input = document.createElement("input");
            input.name = "path";
            input.value = path;
            form.appendChild(input);
            form.style.display = "none";
            document.body.appendChild(form);
            form.submit();
        }
    };
    $scope.$on("event:doc:scopeChangedEvent", function(event, scope, sectionType) {
        $scope.sectionType = sectionType;
        $scope.initDocs(scope, 500);
    });
    $scope.isLink = function(path) {
        return path && path != null && path.startsWith("http");
    };
    $scope.downloadDocument = function(path) {
        if (path != null) {
            var form = document.createElement("form");
            form.action = "api/documentation/downloadDocument";
            form.method = "POST";
            form.target = "_target";
            var input = document.createElement("input");
            input.name = "path";
            input.value = path;
            form.appendChild(input);
            form.style.display = "none";
            document.body.appendChild(form);
            form.submit();
        }
    };
    $scope.addDocument = function() {
        $scope.actionError = null;
        var modalInstance = $modal.open({
            templateUrl: "views/documentation/edit-document.html",
            controller: "CreateOrEditDocumentCtrl",
            windowClass: "documentation-upload-modal",
            backdrop: "static",
            keyboard: false,
            backdropClick: false,
            resolve: {
                totalNumber: function() {
                    return $scope.docs.length + 1;
                },
                document: function() {
                    var document = {};
                    document.position = $scope.docs.length + 1;
                    document.type = $scope.type;
                    document.scope = $scope.scope;
                    document.domain = $scope.sectionType !== "app" ? $rootScope.domain.domain : $scope.sectionType;
                    return document;
                },
                accept: function() {
                    return ".zip";
                }
            }
        });
        modalInstance.result.then(function(document) {
            if (document && document != null) {
                Notification.success({
                    message: "Document added successfully !",
                    templateUrl: "NotificationSuccessTemplate.html",
                    scope: $rootScope,
                    delay: 5e3
                });
                $scope.initDocs($scope.scope, 100);
            }
        });
    };
    $scope.editDocument = function(document) {
        $scope.actionError = null;
        var modalInstance = $modal.open({
            templateUrl: "views/documentation/edit-document.html",
            controller: "CreateOrEditDocumentCtrl",
            windowClass: "documentation-upload-modal",
            backdrop: "static",
            keyboard: false,
            backdropClick: false,
            resolve: {
                totalNumber: function() {
                    return $scope.docs.length + 1;
                },
                document: function() {
                    return angular.copy(document);
                },
                accept: function() {
                    return ".zip";
                }
            }
        });
        modalInstance.result.then(function(document) {
            if (document && document != null) {
                Notification.success({
                    message: "Document saved successfully !",
                    templateUrl: "NotificationSuccessTemplate.html",
                    scope: $rootScope,
                    delay: 5e3
                });
                $scope.initDocs($scope.scope, 100);
            }
        });
    };
    $scope.deleteDocument = function(document) {
        $scope.actionError = null;
        var modalInstance = $modal.open({
            templateUrl: "views/documentation/confirm-delete.html",
            controller: "ConfirmDialogCtrl",
            size: "md",
            backdrop: "static",
            keyboard: false
        });
        modalInstance.result.then(function(result) {
            if (result) {
                DocumentationManager.deleteDocument(document.id).then(function(result) {
                    Notification.success({
                        message: "Document deleted successfully !",
                        templateUrl: "NotificationSuccessTemplate.html",
                        scope: $rootScope,
                        delay: 5e3
                    });
                    $scope.initDocs($scope.scope, 100);
                }, function(error) {
                    $scope.actionError = "Sorry, Cannot delete the document. Please try again. \n DEBUG:" + error;
                });
            }
        });
    };
    $scope.publishDocument = function(document) {
        $scope.actionError = null;
        var modalInstance = $modal.open({
            templateUrl: "views/documentation/confirm-publish.html",
            controller: "ConfirmDialogCtrl",
            size: "md",
            backdrop: "static",
            keyboard: false
        });
        modalInstance.result.then(function(result) {
            if (result) {
                DocumentationManager.publishDocument(document.id).then(function(result) {
                    Notification.success({
                        message: "Document published successfully !",
                        templateUrl: "NotificationSuccessTemplate.html",
                        scope: $rootScope,
                        delay: 5e3
                    });
                    $scope.initDocs($scope.scope, 100);
                }, function(error) {
                    $scope.actionError = "Sorry, Cannot publish the document. Please try again. \n DEBUG:" + error;
                });
            }
        });
    };
});

angular.module("doc").controller("ApiDocsCtrl", function($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, $window, StorageService) {
    $scope.data = [];
    $scope.loading = false;
    $scope.error = null;
    $scope.scrollbarWidth = $rootScope.getScrollbarWidth();
    $scope.apiLink = function() {
        return $rootScope.apiLink;
    };
});

angular.module("doc").controller("InstallationGuideCtrl", function($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, DocumentationManager, StorageService, $modal, Notification) {
    $scope.docs = [];
    $scope.loading = false;
    $scope.error = null;
    $scope.scope = null;
    $scope.loading = false;
    $scope.scope = null;
    $scope.type = "INSTALLATION";
    $scope.sectionType = $rootScope.domain;
    $scope.loadDocs = function(scope, domain) {
        if (domain != null) {
            $scope.loading = true;
            if (scope === null || scope === undefined) {
                scope = StorageService.get("DOC_MANAGE_SELECTED_SCOPE_KEY");
                scope = scope && scope != null ? scope : "GLOBAL";
            }
            $scope.scope = scope;
            DocumentationManager.getDocuments(domain, scope, $scope.type).then(function(result) {
                $scope.error = null;
                $scope.docs = result;
                $scope.loading = false;
            }, function(error) {
                $scope.loading = false;
                $scope.error = "Sorry, failed to load the files";
                $scope.data = [];
            });
        }
    };
    $scope.initDocs = function(scope, wait) {
        if ($scope.sectionType !== "app") {
            $scope.initDomainDocs(scope, wait);
        } else {
            $scope.initAppDocs(scope, wait);
        }
    };
    $scope.initDomainDocs = function(scope, wait) {
        $timeout(function() {
            if ($rootScope.domain != null) {
                $scope.loadDocs(scope, $rootScope.domain.domain, wait);
            }
        }, wait);
    };
    $scope.initAppDocs = function(scope, wait) {
        $timeout(function() {
            $scope.loadDocs(scope, "app", wait);
        }, wait);
    };
    $scope.initDocs(null, 3e3);
    $scope.$on("event:doc:scopeChangedEvent", function(event, scope, sectionType) {
        $scope.sectionType = sectionType;
        $scope.initDocs(scope, 500);
    });
    $scope.isLink = function(path) {
        return path && path != null && path.startsWith("http");
    };
    $scope.downloadDocument = function(path) {
        if (path != null) {
            var form = document.createElement("form");
            form.action = "api/documentation/downloadDocument";
            form.method = "POST";
            form.target = "_target";
            var input = document.createElement("input");
            input.name = "path";
            input.value = path;
            form.appendChild(input);
            form.style.display = "none";
            document.body.appendChild(form);
            form.submit();
        }
    };
    $scope.addDocument = function() {
        $scope.actionError = null;
        var modalInstance = $modal.open({
            templateUrl: "views/documentation/edit-document.html",
            controller: "CreateOrEditDocumentCtrl",
            windowClass: "documentation-upload-modal",
            backdrop: "static",
            keyboard: false,
            backdropClick: false,
            resolve: {
                totalNumber: function() {
                    return $scope.docs.length + 1;
                },
                document: function() {
                    var document = {};
                    document.position = $scope.docs.length + 1;
                    document.type = $scope.type;
                    document.scope = $scope.scope;
                    document.domain = $scope.sectionType !== "app" ? $rootScope.domain.domain : $scope.sectionType;
                    return document;
                },
                accept: function() {
                    return ".pdf,.doc,.docx,.pptx,.ppt";
                }
            }
        });
        modalInstance.result.then(function(document) {
            if (document && document != null) {
                Notification.success({
                    message: "Document added successfully !",
                    templateUrl: "NotificationSuccessTemplate.html",
                    scope: $rootScope,
                    delay: 5e3
                });
                $scope.initDocs($scope.scope, 100);
            }
        });
    };
    $scope.editDocument = function(document) {
        $scope.actionError = null;
        var modalInstance = $modal.open({
            templateUrl: "views/documentation/edit-document.html",
            controller: "CreateOrEditDocumentCtrl",
            windowClass: "documentation-upload-modal",
            backdrop: "static",
            keyboard: false,
            backdropClick: false,
            resolve: {
                totalNumber: function() {
                    return $scope.docs.length + 1;
                },
                document: function() {
                    return angular.copy(document);
                },
                accept: function() {
                    return ".pdf,.doc,.docx,.pptx,.ppt";
                }
            }
        });
        modalInstance.result.then(function(document) {
            if (document && document != null) {
                Notification.success({
                    message: "Document saved successfully !",
                    templateUrl: "NotificationSuccessTemplate.html",
                    scope: $rootScope,
                    delay: 5e3
                });
                $scope.initDocs($scope.scope, 100);
            }
        });
    };
    $scope.deleteDocument = function(document) {
        $scope.actionError = null;
        var modalInstance = $modal.open({
            templateUrl: "views/documentation/confirm-delete.html",
            controller: "ConfirmDialogCtrl",
            size: "md",
            backdrop: "static",
            keyboard: false
        });
        modalInstance.result.then(function(result) {
            if (result) {
                DocumentationManager.deleteDocument(document.id).then(function(result) {
                    Notification.success({
                        message: "Document deleted successfully !",
                        templateUrl: "NotificationSuccessTemplate.html",
                        scope: $rootScope,
                        delay: 5e3
                    });
                    $scope.initDocs($scope.scope, 100);
                }, function(error) {
                    $scope.actionError = "Sorry, Cannot delete the document. Please try again. \n DEBUG:" + error;
                });
            }
        });
    };
    $scope.publishDocument = function(document) {
        $scope.actionError = null;
        var modalInstance = $modal.open({
            templateUrl: "views/documentation/confirm-publish.html",
            controller: "ConfirmDialogCtrl",
            size: "md",
            backdrop: "static",
            keyboard: false
        });
        modalInstance.result.then(function(result) {
            if (result) {
                DocumentationManager.publishDocument(document.id).then(function(result) {
                    Notification.success({
                        message: "Document published successfully !",
                        templateUrl: "NotificationSuccessTemplate.html",
                        scope: $rootScope,
                        delay: 5e3
                    });
                    $scope.initDocs($scope.scope, 100);
                }, function(error) {
                    $scope.actionError = "Sorry, Cannot publish the document. Please try again. \n DEBUG:" + error;
                });
            }
        });
    };
});

angular.module("doc").controller("TestCaseDocumentationCtrl", function($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, DocumentationManager, ngTreetableParams, StorageService, Notification) {
    $scope.context = null;
    $scope.data = null;
    $scope.loading = false;
    $scope.scrollbarWidth = $rootScope.getScrollbarWidth();
    $scope.error = null;
    $scope.error = null;
    $scope.tree = {};
    $scope.sectionType = $rootScope.domain;
    $scope.loadDocs = function(scope, domain) {
        $scope.loading = true;
        if (scope === null || scope === undefined) {
            scope = StorageService.get("DOC_MANAGE_SELECTED_SCOPE_KEY");
            scope = scope && scope != null ? scope : "GLOBAL";
        }
        $scope.scope = scope;
        $scope.domain = domain;
        if (!$rootScope.isDomainSelectionSupported() && $rootScope.appInfo.domains.length === 1) {
            $scope.domain = $rootScope.appInfo.domains[0].domain;
        }
        DocumentationManager.getTestCaseDocuments($scope.domain, "GLOBALANDUSER").then(function(data) {
            $scope.error = null;
            $scope.context = data;
            $scope.data = [];
            if (data != null) {
                for (var index = 0; index < data.length; index++) {
                    $scope.data.push(angular.fromJson($scope.context[index].json));
                }
            }
            $scope.params.refresh();
            $scope.loading = false;
        }, function(error) {
            $scope.loading = false;
            $scope.error = "Sorry, failed to load the documents";
        });
    };
    $scope.initDocs = function(scope, wait) {
        if ($scope.sectionType !== "app") {
            $scope.initDomainDocs(scope, wait);
        } else {
            $scope.initAppDocs(scope, wait);
        }
    };
    $scope.initDomainDocs = function(scope, wait) {
        $timeout(function() {
            if ($rootScope.domain != null) {
                $scope.loadDocs(scope, $rootScope.domain.domain, wait);
            }
        }, wait);
    };
    $scope.initAppDocs = function(scope, wait) {
        $timeout(function() {
            $scope.loadDocs(scope, "app", wait);
        }, wait);
    };
    $scope.initDocs(null, 3e3);
    $scope.$on("event:doc:scopeChangedEvent", function(event, scope, sectionType) {
        $scope.sectionType = sectionType;
        $scope.initDocs(scope, 500);
    });
    $scope.params = new ngTreetableParams({
        getNodes: function(parent) {
            return parent ? parent.children : $scope.data != null ? $scope.data : [];
        },
        getTemplate: function(node) {
            return "TestCaseDocumentationNode.html";
        },
        options: {
            initialState: "expanded"
        }
    });
    $scope.downloadCompleteTestPackage = function(stage) {
        if (stage != null && $scope.scope != null && $scope.domain != null) {
            var form = document.createElement("form");
            form.action = "api/documentation/testPackages";
            form.method = "POST";
            form.target = "_target";
            var input = document.createElement("input");
            input.name = "stage";
            input.value = stage;
            form.appendChild(input);
            input = document.createElement("input");
            input.name = "domain";
            input.value = $scope.domain;
            form.appendChild(input);
            input = document.createElement("input");
            input.name = "scope";
            input.value = $scope.scope;
            form.appendChild(input);
            form.style.display = "none";
            document.body.appendChild(form);
            form.submit();
        }
    };
    $scope.downloadExampleMessages = function(stage) {
        if (stage != null && $scope.scope != null && $scope.domain != null) {
            var form = document.createElement("form");
            form.action = "api/documentation/exampleMessages";
            form.method = "POST";
            form.target = "_target";
            var input = document.createElement("input");
            input.name = "stage";
            input.value = stage;
            form.appendChild(input);
            input = document.createElement("input");
            input.name = "domain";
            input.value = $scope.domain;
            form.appendChild(input);
            input = document.createElement("input");
            input.name = "scope";
            input.value = $scope.scope;
            form.appendChild(input);
            form.style.display = "none";
            document.body.appendChild(form);
            form.submit();
        }
    };
    $scope.downloadArtifact = function(path, title) {
        if (path != null && title) {
            var form = document.createElement("form");
            form.action = "api/documentation/artifact";
            form.method = "POST";
            form.target = "_target";
            var input = document.createElement("input");
            input.name = "path";
            input.value = path;
            form.appendChild(input);
            input = document.createElement("input");
            input.name = "title";
            input.value = title;
            form.appendChild(input);
            form.style.display = "none";
            document.body.appendChild(form);
            form.submit();
        }
    };
    $scope.formatUrl = function(format) {
        return "api/" + format + "/documentation/";
    };
    $scope.downloadMessage = function(row) {
        $scope.downloadContextFile(row.id, row.type, $scope.formatUrl(row.format) + "message.txt", row.title);
    };
    $scope.downloadProfile = function(row) {
        $scope.downloadContextFile(row.id, row.type, $scope.formatUrl(row.format) + "profile.xml", row.title);
    };
    $scope.downloadValueSetLib = function(row) {
        $scope.downloadContextFile(row.id, row.type, $scope.formatUrl(row.format) + "valueset.xml", row.title);
    };
    $scope.downloadConstraints = function(row) {
        $scope.downloadContextFile(row.id, row.type, $scope.formatUrl(row.format) + "constraints.zip", row.title);
    };
    $scope.downloadCoConstraints = function(row) {
        $scope.downloadContextFile(row.id, row.type, $scope.formatUrl(row.format) + "coconstraints.xml", row.title);
    };
    $scope.downloadValueSetBindings = function(row) {
        $scope.downloadContextFile(row.id, row.type, $scope.formatUrl(row.format) + "valuesetbindings.xml", row.title);
    };
    $scope.downloadSlicings = function(row) {
        $scope.downloadContextFile(row.id, row.type, $scope.formatUrl(row.format) + "slicings.xml", row.title);
    };
    $scope.downloadContextFile = function(targetId, targetType, targetUrl, targetTitle) {
        if (targetId != null && targetType != null && targetUrl != null) {
            var form = document.createElement("form");
            form.action = targetUrl;
            form.method = "POST";
            form.target = "_target";
            var input = document.createElement("input");
            input.name = "targetId";
            input.value = targetId;
            form.appendChild(input);
            input = document.createElement("input");
            input.name = "targetType";
            input.value = targetType;
            form.appendChild(input);
            input = document.createElement("input");
            input.name = "targetTitle";
            input.value = targetTitle;
            form.appendChild(input);
            form.style.display = "none";
            document.body.appendChild(form);
            form.submit();
        }
    };
    $scope.downloadDocument = function(path) {
        if (path != null) {
            var form = document.createElement("form");
            form.action = "api/documentation/downloadDocument";
            form.method = "POST";
            form.target = "_target";
            var input = document.createElement("input");
            input.name = "path";
            input.value = path;
            form.appendChild(input);
            form.style.display = "none";
            document.body.appendChild(form);
            form.submit();
        }
    };
});

"use strict";

angular.module("cf").controller("CFEnvCtrl", [ "$scope", "$window", "$rootScope", "CF", "StorageService", "$timeout", "TestCaseService", "TestStepService", "$routeParams", "$location", "userInfoService", "$modalStack", "$modal", function($scope, $window, $rootScope, CB, StorageService, $timeout, TestCaseService, TestStepService, $routeParams, $location, userInfoService, $modalStack, $modal) {
    $scope.testCase = null;
    $scope.token = $routeParams.x;
    $scope.nav = $routeParams.nav;
    $scope.setSubActive = function(tab) {
        $rootScope.setSubActive(tab);
        if (tab === "/cf_execution") {
            $rootScope.$broadcast("event:cf:initExecution");
            $scope.$broadcast("cf:refreshEditor");
        } else if (tab === "/cf_management") {
            $scope.$broadcast("event:cf:initManagement");
        }
    };
    $scope.initEnv = function() {
        var tab = StorageService.get(StorageService.ACTIVE_SUB_TAB_KEY);
        if (tab == null || tab != "/cf_execution") tab = "/cf_execution";
        $scope.setSubActive(tab);
    };
    if ($scope.token !== undefined) {
        if (!userInfoService.isAuthenticated()) {
            $scope.$broadcast("event:loginRequiredWithRedirect", $location.url());
        } else {
            $timeout(function() {
                $scope.setSubActive("/cf_management");
                $scope.$broadcast("cf:uploadToken", $scope.token);
            });
        }
    } else {
        if ($scope.nav === "manage" && userInfoService.isAuthenticated()) {
            $timeout(function() {
                $scope.setSubActive("/cf_management");
                $scope.$broadcast("event:cf:manage", decodeURIComponent($routeParams.scope));
            });
        } else {
            $timeout(function() {
                $scope.setSubActive("/cf_execution");
                $scope.$broadcast("event:cf:execute", decodeURIComponent($routeParams.scope), decodeURIComponent($routeParams.cat), decodeURIComponent($routeParams.group));
            });
        }
    }
} ]);

angular.module("cf").controller("CFTestExecutionCtrl", [ "$scope", "$http", "CF", "$window", "$modal", "$filter", "$rootScope", "CFTestPlanExecutioner", "$timeout", "StorageService", "TestCaseService", "TestStepService", "userInfoService", function($scope, $http, CF, $window, $modal, $filter, $rootScope, CFTestPlanExecutioner, $timeout, StorageService, TestCaseService, TestStepService, userInfoService) {
    $scope.cf = CF;
    $scope.loading = false;
    $scope.loadingTC = false;
    $scope.error = null;
    $scope.testCases = [];
    $scope.testCase = null;
    $scope.tree = {};
    $scope.tabs = new Array();
    $scope.error = null;
    $scope.collapsed = false;
    $scope.selectedTP = {
        id: null
    };
    $scope.selectedScope = {
        key: null
    };
    $scope.allTestPlanScopes = [ {
        key: "USER",
        name: "Private"
    }, {
        key: "GLOBAL",
        name: "Public"
    } ];
    $scope.testPlanScopes = [];
    var testCaseService = new TestCaseService();
    $scope.setActiveTab = function(value) {
        $scope.tabs[0] = false;
        $scope.tabs[1] = false;
        $scope.tabs[2] = false;
        $scope.tabs[3] = false;
        $scope.activeTab = value;
        $scope.tabs[$scope.activeTab] = true;
    };
    $scope.getTestCaseDisplayName = function(testCase) {
        return testCase.parentName + " - " + testCase.label;
    };
    $scope.selectTP = function() {
        $scope.loadingTC = false;
        $scope.errorTC = null;
        $scope.testCase = null;
        $scope.testCases = null;
        StorageService.set(StorageService.CF_SELECTED_TESTPLAN_ID_KEY, "");
        if ($scope.selectedTP.id && $scope.selectedTP.id !== null && $scope.selectedTP.id !== "") {
            $scope.loadingTC = true;
            CFTestPlanExecutioner.getTestPlan($scope.selectedTP.id).then(function(testPlan) {
                if (testPlan.scope === $scope.selectedScope.key) {
                    $scope.testCases = [ testPlan ];
                    testCaseService.buildCFTestCases(testPlan);
                    $scope.refreshTree();
                    StorageService.set(StorageService.CF_SELECTED_TESTPLAN_ID_KEY, $scope.selectedTP.id);
                    $scope.loadingTC = false;
                } else {
                    $scope.testCases = null;
                    StorageService.set(StorageService.CF_SELECTED_TESTPLAN_ID_KEY, "");
                    $scope.loadingTC = false;
                }
            }, function(error) {
                $scope.errorTP = "Sorry, Cannot load the test cases. Please try again";
            });
        } else {
            $scope.testCases = null;
            StorageService.set(StorageService.CF_SELECTED_TESTPLAN_ID_KEY, "");
            $scope.loadingTC = false;
        }
    };
    $scope.selectScope = function() {
        $scope.error = null;
        $scope.errorTP = null;
        $scope.testCases = null;
        $scope.testPlans = null;
        $scope.testCase = null;
        $scope.loadingTC = false;
        $scope.loading = false;
        $scope.selectedTP.id = "";
        StorageService.set(StorageService.CF_SELECTED_TESTPLAN_SCOPE_KEY, $scope.selectedScope.key);
        StorageService.set(StorageService.CF_LOADED_TESTCASE_ID_KEY, null);
        if ($scope.selectedScope.key && $scope.selectedScope.key !== null && $scope.selectedScope.key !== "" && $rootScope.domain != null && $rootScope.domain.domain != null) {
            $scope.loading = true;
            CFTestPlanExecutioner.getTestPlans($scope.selectedScope.key, $rootScope.domain.domain).then(function(testPlans) {
                $scope.error = null;
                $scope.testPlans = $filter("orderBy")(testPlans, "position");
                var targetId = null;
                if ($scope.testPlans.length > 0) {
                    if ($scope.testPlans.length === 1) {
                        targetId = $scope.testPlans[0].id;
                    } else {
                        var previousTpId = StorageService.get(StorageService.CF_SELECTED_TESTPLAN_ID_KEY);
                        targetId = previousTpId == undefined || previousTpId == null ? "" : previousTpId;
                        if (previousTpId != null && previousTpId != undefined && previousTpId != "") {
                            var tp = findTPById(previousTpId, $scope.testPlans);
                            if (tp != null && tp.scope === $scope.selectedScope.key) {
                                targetId = tp.id;
                            }
                        }
                    }
                    if (targetId == null && userInfoService.isAuthenticated()) {
                        var lastTestPlanPersistenceId = userInfoService.getLastTestPlanPersistenceId();
                        var tp = findTPByPersistenceId(lastTestPlanPersistenceId, $scope.testPlans);
                        if (tp != null && tp.scope === $scope.selectedScope.key) {
                            targetId = tp.id;
                        }
                    }
                    if (targetId != null) {
                        $scope.selectedTP.id = targetId.toString();
                    }
                    $scope.selectTP();
                } else {
                    $scope.loadingTC = false;
                }
                $scope.loading = false;
            }, function(error) {
                $scope.loadingTC = false;
                $scope.loading = false;
                $scope.error = "Sorry, Cannot load the test plans. Please try again";
            });
        } else {
            $scope.loading = false;
            StorageService.set(StorageService.CF_SELECTED_TESTPLAN_ID_KEY, "");
        }
    };
    var findTPByPersistenceId = function(persistentId, testPlans) {
        if (testPlans != null && testPlans != undefined) {
            for (var i = 0; i < testPlans.length; i++) {
                if (testPlans[i].persistentId === persistentId) {
                    return testPlans[i];
                }
            }
        }
        return null;
    };
    var findTPById = function(id, testPlans) {
        if (testPlans != null && testPlans != undefined) {
            for (var i = 0; i < testPlans.length; i++) {
                if (testPlans[i].id === id) {
                    return testPlans[i];
                }
            }
        }
        return null;
    };
    $scope.selectTestCase = function(testCase) {
        $scope.loadingTC = true;
        $timeout(function() {
            var previousId = StorageService.get(StorageService.CF_LOADED_TESTCASE_ID_KEY);
            if (previousId != null) TestStepService.clearRecords(previousId);
            if (testCase.testContext && testCase.testContext != null) {
                CF.testCase = testCase;
                $scope.testCase = CF.testCase;
                var id = StorageService.get(StorageService.CF_LOADED_TESTCASE_ID_KEY);
                if (id != testCase.id) {
                    StorageService.set(StorageService.CF_LOADED_TESTCASE_ID_KEY, testCase.id);
                    StorageService.remove(StorageService.CF_EDITOR_CONTENT_KEY);
                }
                $scope.$broadcast("cf:testCaseLoaded", $scope.testCase);
                $scope.$broadcast("cf:profileLoaded", $scope.testCase.testContext.profile);
                $scope.$broadcast("cf:valueSetLibraryLoaded", $scope.testCase.testContext.vocabularyLibrary);
            }
            $scope.loadingTC = false;
        });
    };
    $scope.refreshTree = function() {
        $timeout(function() {
            if ($scope.testCases != null) {
                if (typeof $scope.tree.build_all == "function") {
                    $scope.tree.build_all($scope.testCases);
                    var testCase = null;
                    var id = StorageService.get(StorageService.CF_LOADED_TESTCASE_ID_KEY);
                    if (id != null) {
                        for (var i = 0; i < $scope.testCases.length; i++) {
                            var found = testCaseService.findOneById(id, $scope.testCases[i]);
                            if (found != null) {
                                testCase = found;
                                break;
                            }
                        }
                    }
                    if (testCase == null && $scope.testCases != null && $scope.testCases.length >= 0) {
                        testCase = $scope.testCases[0];
                    }
                    if (testCase != null) {
                        $scope.selectNode(testCase.id, testCase.type);
                    }
                    $scope.expandAll();
                    $scope.error = null;
                } else {
                    $scope.error = "Error: Something went wrong. Please refresh your page again.";
                }
            }
            $scope.loading = false;
        }, 1e3);
    };
    $scope.initTesting = function() {
        $timeout(function() {
            if (userInfoService.isAuthenticated()) {
                $scope.testPlanScopes = $scope.allTestPlanScopes;
                var tmp = StorageService.get(StorageService.CF_SELECTED_TESTPLAN_SCOPE_KEY);
                $scope.selectedScope.key = tmp && tmp != null ? tmp : $scope.testPlanScopes[1].key;
            } else {
                $scope.testPlanScopes = [ $scope.allTestPlanScopes[1] ];
                $scope.selectedScope.key = $scope.allTestPlanScopes[1].key;
            }
            $scope.selectScope();
        }, 1e3);
    };
    $scope.selectNode = function(id, type) {
        $timeout(function() {
            testCaseService.selectNodeByIdAndType($scope.tree, id, type);
        }, 0);
    };
    $scope.openProfileInfo = function() {
        var modalInstance = $modal.open({
            templateUrl: "CFProfileInfoCtrl.html",
            windowClass: "profile-modal",
            controller: "CFProfileInfoCtrl"
        });
    };
    $scope.isSelectable = function(node) {
        return node.testContext && node.testContext != null;
    };
    $scope.expandAll = function() {
        if ($scope.tree != null) $scope.tree.expand_all();
    };
    $scope.collapseAll = function() {
        if ($scope.tree != null) $scope.tree.collapse_all();
    };
    $scope.$on("$destroy", function() {
        var testStepId = StorageService.get(StorageService.CF_LOADED_TESTCASE_ID_KEY);
        if (testStepId != null) TestStepService.clearRecords(testStepId);
    });
    $rootScope.$on("event:logoutConfirmed", function() {
        $scope.initTesting();
    });
    $rootScope.$on("event:loginConfirmed", function() {
        $scope.initTesting();
    });
    $scope.$on("event:cf:execute", function(event, scope, cat, group) {
        $scope.selectedScope.key = scope && scope != null && (scope === "USER" || scope === "GLOBAL") ? scope : $scope.testPlanScopes[0] != null ? $scope.testPlanScopes[0].key : "GLOBAL";
        if (group && group != null) {
            $scope.selectedTP.id = group;
            StorageService.set(StorageService.CF_SELECTED_TESTPLAN_ID_KEY, group);
        }
        $scope.selectScope();
    });
    $rootScope.$on("event:cf:initExecution", function() {
        $scope.initTesting();
    });
} ]);

angular.module("cf").controller("CFProfileInfoCtrl", function($scope, $modalInstance) {
    $scope.close = function() {
        $modalInstance.dismiss("cancel");
    };
});

angular.module("cf").controller("CFValidatorCtrl", [ "$scope", "$http", "CF", "$window", "$timeout", "$modal", "NewValidationResult", "$rootScope", "ServiceDelegator", "StorageService", "TestStepService", "MessageUtil", "FileUpload", "Notification", function($scope, $http, CF, $window, $timeout, $modal, NewValidationResult, $rootScope, ServiceDelegator, StorageService, TestStepService, MessageUtil, FileUpload, Notification) {
    $scope.cf = CF;
    $scope.testCase = CF.testCase;
    $scope.message = CF.message;
    $scope.selectedMessage = {};
    $scope.loading = true;
    $scope.error = null;
    $scope.vError = null;
    $scope.vLoading = true;
    $scope.mError = null;
    $scope.mLoading = true;
    $scope.delimeters = [];
    $scope.counter = 0;
    $scope.type = "cf";
    $scope.loadRate = 4e3;
    $scope.tokenPromise = null;
    $scope.editorInit = false;
    $scope.nodelay = false;
    $scope.resized = false;
    $scope.selectedItem = null;
    $scope.activeTab = 0;
    $scope.tError = null;
    $scope.tLoading = false;
    $scope.hasNonPrintable = false;
    $scope.dqaCodes = StorageService.get(StorageService.DQA_OPTIONS_KEY) != null ? angular.fromJson(StorageService.get(StorageService.DQA_OPTIONS_KEY)) : [];
    $scope.showDQAOptions = function() {
        var modalInstance = $modal.open({
            templateUrl: "DQAConfig.html",
            controller: "DQAConfigCtrl",
            windowClass: "dq-modal",
            animation: true,
            keyboard: false,
            backdrop: false
        });
        modalInstance.result.then(function(selectedCodes) {
            $scope.dqaCodes = selectedCodes;
        }, function() {});
    };
    $scope.hasContent = function() {
        return $scope.cf.message.content != "" && $scope.cf.message.content != null;
    };
    $scope.refreshEditor = function() {
        $timeout(function() {
            if ($scope.editor) $scope.editor.refresh();
        }, 1e3);
    };
    $scope.uploadMessage = function(file, errFiles) {
        $scope.f = file;
        FileUpload.uploadMessage(file, errFiles).then(function(response) {
            $timeout(function() {
                file.result = response.data;
                var result = response.data;
                var fileName = file.name;
                $scope.nodelay = true;
                var tmp = angular.fromJson(result);
                $scope.cf.message.name = fileName;
                $scope.cf.editor.instance.doc.setValue(tmp.content);
                $scope.mError = null;
                $scope.execute();
                Notification.success({
                    message: "File " + fileName + " successfully uploaded!",
                    templateUrl: "NotificationSuccessTemplate.html",
                    scope: $rootScope,
                    delay: 3e4
                });
            });
        }, function(response) {
            $scope.mError = response.data;
        });
    };
    $scope.loadMessage = function() {
        if ($scope.cf.testCase.testContext.message && $scope.cf.testCase.testContext.message != null) {
            $scope.nodelay = true;
            $scope.selectedMessage = $scope.cf.testCase.testContext.message;
            if ($scope.selectedMessage != null && $scope.selectedMessage.content != null) {
                $scope.editor.doc.setValue($scope.selectedMessage.content);
            } else {
                $scope.editor.doc.setValue("");
                $scope.cf.message.id = null;
                $scope.cf.message.name = "";
            }
            $scope.execute();
        }
    };
    $scope.setLoadRate = function(value) {
        $scope.loadRate = value;
    };
    $scope.initCodemirror = function() {
        $scope.editor = CodeMirror.fromTextArea(document.getElementById("cfTextArea"), {
            lineNumbers: true,
            fixedGutter: true,
            theme: "elegant",
            readOnly: false,
            showCursorWhenSelecting: true,
            gutters: [ "CodeMirror-linenumbers", "cm-edi-segment-name" ]
        });
        $scope.editor.setSize("100%", 345);
        $scope.editor.on("keyup", function() {
            $timeout(function() {
                var msg = $scope.editor.doc.getValue();
                $scope.error = null;
                if ($scope.tokenPromise) {
                    $timeout.cancel($scope.tokenPromise);
                    $scope.tokenPromise = undefined;
                }
                CF.message.name = null;
                if (msg.trim() !== "") {
                    $scope.tokenPromise = $timeout(function() {
                        $scope.execute();
                    }, $scope.loadRate);
                } else {
                    $scope.execute();
                }
            });
        });
        $scope.editor.on("dblclick", function(editor) {
            $timeout(function() {
                var coordinate = ServiceDelegator.getCursorService($scope.testCase.testContext.format).getCoordinate($scope.editor, $scope.cf.tree);
                coordinate.start.index = coordinate.start.index + 1;
                coordinate.end.index = coordinate.end.index + 1;
                $scope.cf.cursor.init(coordinate, true);
                ServiceDelegator.getTreeService($scope.testCase.testContext.format).selectNodeByIndex($scope.cf.tree.root, CF.cursor, CF.message.content);
            });
        });
    };
    $scope.validateMessage = function() {
        try {
            $scope.vLoading = true;
            $scope.vError = null;
            if ($scope.cf.testCase != null && $scope.cf.message.content !== "") {
                var id = $scope.cf.testCase.testContext.id;
                var content = $scope.cf.message.content;
                var label = $scope.cf.testCase.label;
                var validated = ServiceDelegator.getMessageValidator($scope.testCase.testContext.format).validate(id, content, null, "Free", $scope.cf.testCase.testContext.dqa === true ? $scope.dqaCodes : [], "1223");
                validated.then(function(mvResult) {
                    $scope.vLoading = false;
                    $scope.loadValidationResult(mvResult);
                }, function(error) {
                    $scope.vLoading = false;
                    $scope.vError = error;
                    $scope.loadValidationResult(null);
                });
            } else {
                $scope.loadValidationResult(null);
                $scope.vLoading = false;
                $scope.vError = null;
            }
        } catch (error) {
            $scope.vLoading = false;
            $scope.vError = error;
            $scope.loadValidationResult(null);
        }
    };
    $scope.loadValidationResult = function(mvResult) {
        $timeout(function() {
            $rootScope.$emit("cf:validationResultLoaded", mvResult, $scope.cf.testCase);
        });
    };
    $scope.select = function(element) {
        if (element != undefined && element.path != null && element.line != -1) {
            var node = ServiceDelegator.getTreeService($scope.testCase.testContext.format).selectNodeByPath($scope.cf.tree.root, element.line, element.path);
            $scope.cf.cursor.init(node.data, false);
            ServiceDelegator.getEditorService($scope.testCase.testContext.format).select($scope.editor, $scope.cf.cursor);
        }
    };
    $scope.clearMessage = function() {
        $scope.nodelay = true;
        $scope.mError = null;
        if ($scope.editor) {
            $scope.editor.doc.setValue("");
            $scope.execute();
        }
    };
    $scope.saveMessage = function() {
        $scope.cf.message.download();
    };
    $scope.parseMessage = function() {
        try {
            if ($scope.cf.testCase != null && $scope.cf.testCase.testContext != null && $scope.cf.message.content != "") {
                $scope.tLoading = true;
                var parsed = ServiceDelegator.getMessageParser($scope.testCase.testContext.format).parse($scope.cf.testCase.testContext.id, $scope.cf.message.content);
                parsed.then(function(value) {
                    $scope.tLoading = false;
                    $scope.cf.tree.root.build_all(value.elements);
                    ServiceDelegator.updateEditorMode($scope.editor, value.delimeters, $scope.cf.testCase.testContext.format);
                    ServiceDelegator.getEditorService($scope.testCase.testContext.format).setEditor($scope.editor);
                    ServiceDelegator.getTreeService($scope.testCase.testContext.format).setEditor($scope.editor);
                }, function(error) {
                    $scope.tLoading = false;
                    $scope.tError = error;
                });
            } else {
                if (typeof $scope.cf.tree.root.build_all == "function") {
                    $scope.cf.tree.root.build_all([]);
                }
                $scope.tError = null;
                $scope.tLoading = false;
            }
        } catch (error) {
            $scope.tLoading = false;
            $scope.tError = error;
        }
    };
    $scope.onNodeSelect = function(node) {
        ServiceDelegator.getTreeService($scope.testCase.testContext.format).getEndIndex(node, $scope.cf.message.content);
        $scope.cf.cursor.init(node.data, false);
        ServiceDelegator.getEditorService($scope.testCase.testContext.format).select($scope.editor, $scope.cf.cursor);
    };
    $scope.execute = function() {
        if ($scope.cf.testCase != null) {
            if ($scope.tokenPromise) {
                $timeout.cancel($scope.tokenPromise);
                $scope.tokenPromise = undefined;
            }
            $scope.error = null;
            $scope.tError = null;
            $scope.mError = null;
            $scope.vError = null;
            $scope.cf.message.content = $scope.editor.doc.getValue();
            $scope.setHasNonPrintableCharacters();
            StorageService.set(StorageService.CF_EDITOR_CONTENT_KEY, $scope.cf.message.content);
            $scope.validateMessage();
            $scope.parseMessage();
            $scope.refreshEditor();
        }
    };
    $scope.removeDuplicates = function() {
        $scope.vLoading = true;
        $scope.$broadcast("cf:removeDuplicates");
    };
    $scope.initValidation = function() {
        $scope.vLoading = false;
        $scope.tLoading = false;
        $scope.mLoading = false;
        $scope.error = null;
        $scope.tError = null;
        $scope.mError = null;
        $scope.vError = null;
        $scope.$on("cf:testCaseLoaded", function(event, testCase) {
            $scope.testCase = testCase;
            if ($scope.testCase != null) {
                var content = StorageService.get(StorageService.CF_EDITOR_CONTENT_KEY) == null ? "" : StorageService.get(StorageService.CF_EDITOR_CONTENT_KEY);
                $scope.nodelay = true;
                $scope.mError = null;
                $timeout(function() {
                    if (!$scope.editor || $scope.editor === null) {
                        $scope.initCodemirror();
                        $scope.refreshEditor();
                    }
                    $scope.cf.editor = ServiceDelegator.getEditor($scope.testCase.testContext.format);
                    $scope.cf.editor.instance = $scope.editor;
                    $scope.cf.cursor = ServiceDelegator.getCursor($scope.testCase.testContext.format);
                    TestStepService.clearRecords($scope.testCase.id);
                    if ($scope.editor) {
                        $scope.editor.doc.setValue(content);
                        $scope.execute();
                    }
                }, 500);
            }
        });
        $rootScope.$on("cf:duplicatesRemoved", function(event, report) {
            $scope.vLoading = false;
        });
    };
    $scope.expandAll = function() {
        if ($scope.cf.tree.root != null) $scope.cf.tree.root.expand_all();
    };
    $scope.collapseAll = function() {
        if ($scope.cf.tree.root != null) $scope.cf.tree.root.collapse_all();
    };
    $scope.expandMessageAll = function() {
        if ($scope.cf.tree.root != null) $scope.cf.tree.root.expand_all();
    };
    $scope.collapseMessageAll = function() {
        if ($scope.cf.tree.root != null) $scope.cf.tree.root.collapse_all();
    };
    $scope.setHasNonPrintableCharacters = function() {
        $scope.hasNonPrintable = MessageUtil.hasNonPrintable($scope.cf.message.content);
    };
    $scope.showMessageWithHexadecimal = function() {
        var modalInstance = $modal.open({
            templateUrl: "MessageWithHexadecimal.html",
            controller: "MessageWithHexadecimalDlgCtrl",
            windowClass: "valueset-modal",
            animation: false,
            keyboard: true,
            backdrop: true,
            resolve: {
                original: function() {
                    return $scope.cf.message.content;
                }
            }
        });
    };
} ]);

angular.module("cf").controller("CFReportCtrl", [ "$scope", "$sce", "$http", "CF", function($scope, $sce, $http, CF) {
    $scope.cf = CF;
} ]);

angular.module("cf").controller("CFVocabularyCtrl", [ "$scope", "CF", function($scope, CF) {
    $scope.cf = CF;
} ]);

angular.module("cf").controller("CFProfileViewerCtrl", [ "$scope", "CF", "$rootScope", function($scope, CF, $rootScope) {
    $scope.cf = CF;
} ]);

angular.module("cf").controller("CFTestManagementCtrl", [ "$scope", "$http", "$window", "$filter", "$rootScope", "$timeout", "StorageService", "TestCaseService", "TestStepService", "FileUploader", "Notification", "userInfoService", "CFTestPlanManager", "modalService", "$modalStack", "$modal", "$routeParams", "$location", function($scope, $http, $window, $filter, $rootScope, $timeout, StorageService, TestCaseService, TestStepService, FileUploader, Notification, userInfoService, CFTestPlanManager, modalService, $modalStack, $modal, $routeParams, $location) {
    $scope.selectedScope = {
        key: "USER"
    };
    $scope.groupScopes = [];
    $scope.allGroupScopes = [ {
        key: "USER",
        name: "Private"
    }, {
        key: "GLOBAL",
        name: "Public"
    } ];
    $scope.uploaded = false;
    $scope.testcase = null;
    $scope.existingTP = {
        selected: null
    };
    $scope.selectedTP = {
        id: null
    };
    $scope.categoryNodes = [];
    $scope.profileValidationErrors = [];
    $scope.valueSetValidationErrors = [];
    $scope.constraintValidationErrors = [];
    $scope.existingTestPlans = null;
    $scope.tmpNewMessages = [];
    $scope.tmpOldMessages = [];
    var testCaseService = new TestCaseService();
    $scope.token = $routeParams.x;
    $scope.positions = function(messages) {
        var array = new Array(messages.length);
        for (var index = 0; index < array.length; index++) {
            array[index] = index + 1;
        }
        return array;
    };
    $scope.filterMessages = function(array) {
        array = _.reject(array, function(item) {
            return item.removed == true;
        });
        array = $filter("orderBy")(array, "position");
        return array;
    };
    $scope.$on("event:cf:manage", function(event, targetScope) {
        $timeout(function() {
            if ($rootScope.isCfManagementSupported() && userInfoService.isAuthenticated()) {
                $scope.testcase = null;
                $scope.groupScopes = $scope.allGroupScopes;
                if (targetScope === $scope.allGroupScopes[1].key && !userInfoService.isAdmin() && !userInfoService.isSupervisor()) {
                    targetScope = $scope.allGroupScopes[0];
                }
                $scope.selectedScope = {
                    key: targetScope
                };
                $scope.testcase = null;
                $scope.selectScope();
            }
        }, 1e3);
    });
    $rootScope.$on("event:logoutConfirmed", function() {
        $scope.initManagement();
    });
    $scope.$on("event:cf:initManagement", function() {
        $scope.initManagement();
    });
    $rootScope.$on("event:loginConfirmed", function() {
        $scope.initManagement();
    });
    $scope.initManagement = function() {
        $timeout(function() {
            if ($rootScope.isCfManagementSupported() && userInfoService.isAuthenticated() && $rootScope.hasWriteAccess()) {
                if (userInfoService.isAdmin() || userInfoService.isSupervisor()) {
                    $scope.groupScopes = $scope.allGroupScopes;
                } else {
                    $scope.groupScopes = [ $scope.allGroupScopes[0] ];
                }
                $scope.selectedScope.key = $scope.groupScopes[0].key;
                $scope.testcase = null;
                $scope.selectScope();
                if ($scope.token !== undefined && $scope.token !== null) {
                    if (userInfoService.isAuthenticated()) {
                        CFTestPlanManager.getTokenProfiles("hl7v2", $scope.token).then(function(response) {
                            if (response.success == false) {
                                if (response.debugError === undefined) {
                                    Notification.error({
                                        message: "The zip file you uploaded is not valid, please check and correct the error(s)",
                                        templateUrl: "NotificationErrorTemplate.html",
                                        scope: $rootScope,
                                        delay: 1e4
                                    });
                                    $scope.profileValidationErrors = angular.fromJson(response.profileErrors);
                                    $scope.valueSetValidationErrors = angular.fromJson(response.constraintsErrors);
                                    $scope.constraintValidationErrors = angular.fromJson(response.vsErrors);
                                } else {
                                    Notification.error({
                                        message: "  " + response.message + "<br>" + response.debugError,
                                        templateUrl: "NotificationErrorTemplate.html",
                                        scope: $rootScope,
                                        delay: 1e4
                                    });
                                }
                            } else {
                                $scope.profileMessages = response.profiles;
                                $scope.tmpNewMessages = $scope.filterMessages($scope.profileMessages);
                                if ($scope.tmpNewMessages.length > 0) {
                                    for (var i = 0; i < $scope.tmpNewMessages.length; i++) {
                                        $scope.tmpNewMessages[i]["position"] = i + 1;
                                    }
                                }
                                $scope.originalProfileMessages = angular.copy($scope.profileMessages);
                            }
                        }, function(response) {});
                    }
                }
            }
        }, 1e3);
    };
    $scope.selectScope = function() {
        $scope.existingTestPlans = null;
        $scope.selectedTP.id = "";
        $scope.error = null;
        $scope.testcase = null;
        $scope.existingTP.selected = null;
        $scope.oldProfileMessages = null;
        $scope.testCases = null;
        StorageService.set(StorageService.CF_MANAGE_SELECTED_TESTPLAN_ID_KEY, null);
        if ($scope.selectedScope.key && $scope.selectedScope.key !== null && $scope.selectedScope.key !== "" && $rootScope.domain != null && $rootScope.domain.domain != null) {
            CFTestPlanManager.getTestPlans($scope.selectedScope.key, $rootScope.domain.domain).then(function(testPlans) {
                $scope.existingTestPlans = testPlans;
                var targetId = null;
                if ($scope.existingTestPlans.length === 1) {
                    targetId = $scope.existingTestPlans[0].id;
                }
                if (targetId == null) {
                    var previousTpId = StorageService.get(StorageService.CF_MANAGE_SELECTED_TESTPLAN_ID_KEY);
                    targetId = previousTpId == undefined || previousTpId == null ? "" : previousTpId;
                }
                if (targetId != null) {
                    $scope.selectedTP.id = targetId.toString();
                    $scope.selectTestPlan();
                }
            }, function(error) {
                $scope.error = "Sorry, Failed to load the profile groups. Please try again";
            });
        }
    };
    $scope.selectTestPlan = function() {
        $scope.loadingTP = false;
        $scope.errorTP = null;
        $scope.errorTC = null;
        $scope.error = null;
        if ($scope.selectedTP.id && $scope.selectedTP.id !== null && $scope.selectedTP.id !== "") {
            $scope.loadingTP = true;
            CFTestPlanManager.getTestPlan($scope.selectedTP.id).then(function(testPlan) {
                $scope.testCases = [ testPlan ];
                $scope.testcase = null;
                $scope.generateTreeNodes(testPlan);
                StorageService.set(StorageService.CF_MANAGE_SELECTED_TESTPLAN_ID_KEY, $scope.selectedTP.id);
                $scope.loadingTP = false;
            }, function(error) {
                $scope.errorTP = "Sorry, Cannot load the test cases. Please try again";
            });
        } else {
            $scope.testCases = null;
            StorageService.set(StorageService.CF_MANAGE_SELECTED_TESTPLAN_ID_KEY, "");
            $scope.loadingTP = false;
        }
    };
    $scope.loadOldProfileMessages = function(groupId, groupType) {
        $scope.OldMessagesErrors = null;
        $scope.oldProfileMessages = null;
        $scope.originalOldProfileMessages = null;
        $scope.tmpOldMessages = null;
        if (groupId != null) {
            if (groupType == "TestPlan") {
                CFTestPlanManager.getTestPlanProfiles(groupId).then(function(profiles) {
                    $scope.oldProfileMessages = profiles;
                    $scope.tmpOldMessages = $scope.filterMessages($scope.oldProfileMessages);
                    $scope.originalOldProfileMessages = angular.copy($scope.oldProfileMessages);
                }, function(error) {
                    $scope.OldMessagesErrors = "Sorry, Failed to load the existing profiles. Please try again";
                });
            } else {
                CFTestPlanManager.getTestStepGroupProfiles(groupId).then(function(profiles) {
                    $scope.oldProfileMessages = profiles;
                    $scope.tmpOldMessages = $scope.filterMessages($scope.oldProfileMessages);
                    $scope.originalOldProfileMessages = angular.copy($scope.oldProfileMessages);
                }, function(error) {
                    $scope.OldMessagesErrors = "Sorry, Failed to load the existing profiles. Please try again";
                });
            }
        }
    };
    $scope.categorize = function(profileGroups) {
        var categoryMap = {};
        if (profileGroups != null && profileGroups.length > 0) {
            angular.forEach(profileGroups, function(profileGroup) {
                if (categoryMap[profileGroup.category] == undefined) {
                    categoryMap[profileGroup.category] = [];
                }
                categoryMap[profileGroup.category].push(profileGroup);
            });
        }
        return categoryMap;
    };
    $scope.generateTreeNodes = function(node) {
        if (node.type !== "TestObject") {
            if (!node["nav"]) node["nav"] = {};
            var that = this;
            if (node.testStepGroups) {
                if (!node["children"]) {
                    node["children"] = node.testStepGroups;
                    angular.forEach(node.children, function(testStepGroup) {
                        testStepGroup["nav"] = {};
                        testStepGroup["parent"] = {
                            id: node.id,
                            type: node.type
                        };
                        $scope.generateTreeNodes(testStepGroup);
                    });
                } else {
                    angular.forEach(node.testStepGroups, function(testStepGroup) {
                        node["children"].push(testStepGroup);
                        testStepGroup["nav"] = {};
                        testStepGroup["parent"] = {
                            id: node.id,
                            type: node.type
                        };
                        $scope.generateTreeNodes(testStepGroup);
                    });
                }
                node["children"] = $filter("orderBy")(node["children"], "position");
                delete node.testStepGroups;
            }
        }
    };
    $scope.deleteGroup = function(node) {
        if (node.type === "TestPlan") {
            $scope.deleteTestPlan(node);
        } else {
            $scope.deleteTestStepGroup(node);
        }
    };
    $scope.deleteTestPlan = function(node) {
        var modalInstance = $modal.open({
            templateUrl: "views/cf/manage/confirm-delete-group.html",
            controller: "ConfirmDialogCtrl",
            size: "md",
            backdrop: "static",
            keyboard: false
        });
        modalInstance.result.then(function(result) {
            if (result) {
                CFTestPlanManager.deleteTestPlan(node).then(function(result) {
                    if (result.status === "SUCCESS") {
                        var testPlan = $scope.findTestPlan(node.id, $scope.existingTestPlans);
                        var index = $scope.existingTestPlans.indexOf(testPlan);
                        if (index > -1) {
                            $scope.existingTestPlans.splice(index, 1);
                        }
                        $scope.testCases = null;
                        Notification.success({
                            message: "Profile group deleted successfully !",
                            templateUrl: "NotificationSuccessTemplate.html",
                            scope: $rootScope,
                            delay: 5e3
                        });
                        if ($scope.testcase != null && node.id === $scope.testcase.groupId && $scope.testcase.type === "TestPlan") {
                            $scope.selectGroup(null);
                        }
                        $scope.selectScope();
                    } else {
                        $scope.error = result.message;
                    }
                }, function(error) {
                    $scope.error = "Sorry, Cannot delete the profile group. Please try again";
                });
            }
        }, function(result) {});
    };
    $scope.deleteTestStepGroup = function(node) {
        var modalInstance = $modal.open({
            templateUrl: "views/cf/manage/confirm-delete-group.html",
            controller: "ConfirmDialogCtrl",
            size: "md",
            backdrop: "static",
            keyboard: false
        });
        modalInstance.result.then(function(result) {
            if (result) {
                CFTestPlanManager.deleteTestStepGroup(node).then(function(result) {
                    if (result.status === "SUCCESS") {
                        Notification.success({
                            message: "Profile group deleted successfully !",
                            templateUrl: "NotificationSuccessTemplate.html",
                            scope: $rootScope,
                            delay: 5e3
                        });
                        if ($scope.testcase != null && node.id === $scope.testcase.groupId && $scope.testcase.type === "TestStepGroup") {
                            $scope.selectGroup(null);
                        }
                        $scope.selectTestPlan();
                    } else {
                        $scope.error = result.message;
                    }
                }, function(error) {
                    $scope.error = "Sorry, Cannot delete the profile group. Please try again";
                });
            }
        }, function(result) {});
    };
    $scope.findGroup = function(groupId, groupType, children) {
        if (groupId != null && groupId != "" && children && children != null && children.length > 0) {
            for (var i = 0; i < children.length; i++) {
                if (children[i].id == groupId && children[i].type === groupType) {
                    return children[i];
                } else {
                    var found = $scope.findGroup(groupId, groupType, children[i].children);
                    if (found != null) {
                        return found;
                    }
                }
            }
        }
        return null;
    };
    $scope.findTestPlan = function(groupId, children) {
        if (groupId != null && groupId != "" && children && children != null && children.length > 0) {
            for (var i = 0; i < children.length; i++) {
                if (children[i].id === groupId) {
                    return children[i];
                }
            }
        }
        return null;
    };
    $scope.findGroupByPersistenceId = function(persistentId) {
        if (persistentId != null && persistentId != "" && $scope.existingTestPlans != null && $scope.existingTestPlans.length > 0) {
            for (var i = 0; i < $scope.existingTestPlans.length; i++) {
                if ($scope.existingTestPlans[i].persistentId == persistentId) {
                    return $scope.existingTestPlans[i];
                }
            }
        }
        return null;
    };
    $scope.selectGroup = function(node) {
        if (node != null) {
            $scope.executionError = null;
            $scope.error = null;
            console.log("node.type=" + node.type);
            $scope.selectedNode = node;
            $scope.oldProfileMessages = [];
            $scope.originalOldProfileMessages = angular.copy($scope.oldProfileMessages);
            $scope.testcase = {};
            $scope.testcase["scope"] = $scope.selectedScope.key;
            $scope.testcase["name"] = node.name;
            $scope.testcase["description"] = node.description;
            $scope.testcase["groupId"] = node.id;
            $scope.testcase["persistentId"] = node.persistentId;
            $scope.testcase["type"] = node.type;
            $scope.testcase["position"] = node.position;
            $scope.loadOldProfileMessages(node.id, node.type);
        }
    };
    $scope.createTestPlan = function() {
        var modalInstance = $modal.open({
            templateUrl: "views/cf/manage/createProfileGroup.html",
            controller: "CreateTestPlanCtrl",
            size: "lg",
            backdrop: "static",
            keyboard: false,
            backdropClick: false,
            resolve: {
                scope: function() {
                    return $scope.selectedScope.key;
                },
                domain: function() {
                    return $rootScope.domain.domain;
                },
                position: function() {
                    return $scope.existingTestPlans ? $scope.existingTestPlans.length + 1 : 1;
                }
            }
        });
        modalInstance.result.then(function(newTestPlan) {
            if (newTestPlan) {
                if (!$scope.existingTestPlans || $scope.existingTestPlans == null) {
                    $scope.existingTestPlans = [];
                }
                StorageService.set(StorageService.CF_MANAGE_SELECTED_TESTPLAN_ID_KEY, null);
                $scope.existingTestPlans.push(newTestPlan);
                $scope.selectedTP.id = newTestPlan.id;
                $scope.selectTestPlan();
            }
        });
    };
    $scope.addNewTestStepGroup = function(parentNode) {
        var modalInstance = $modal.open({
            templateUrl: "views/cf/manage/createProfileGroup.html",
            controller: "CreateTestStepGroupCtrl",
            size: "lg",
            backdrop: "static",
            keyboard: false,
            backdropClick: false,
            resolve: {
                scope: function() {
                    return $scope.selectedScope.key;
                },
                domain: function() {
                    return $rootScope.domain.domain;
                },
                position: function() {
                    return parentNode.children ? parentNode.children.length + 1 : 1;
                },
                parentNode: function() {
                    return parentNode;
                }
            }
        });
        modalInstance.result.then(function(group) {
            if (group) {
                var treeNode = {};
                treeNode["id"] = group.id;
                treeNode["persistentId"] = group.persistentId;
                treeNode["name"] = group.name;
                treeNode["position"] = group.position;
                treeNode["description"] = group.description;
                treeNode["scope"] = group.scope;
                treeNode["type"] = group.type;
                treeNode["nav"] = {};
                treeNode["parent"] = {
                    id: parentNode.id,
                    type: parentNode.type
                };
                if (!parentNode["children"]) parentNode["children"] = [];
                parentNode["children"].push(treeNode);
                parentNode["children"] = $filter("orderBy")(parentNode["children"], "position");
            }
        });
    };
    $scope.afterSave = function(token) {
        $timeout(function() {
            if (token != null && token) {
                var group = StorageService.get(StorageService.CF_MANAGE_SELECTED_TESTPLAN_ID_KEY);
                $location.url("/cf?nav=execution&scope=" + $scope.selectedScope.key + "&group=" + group);
            }
        });
    };
    $scope.publishGroup = function() {
        $scope.error = null;
        $scope.executionError = [];
        var modalInstance = $modal.open({
            templateUrl: "views/cf/manage/confirm-publish-group.html",
            controller: "ConfirmDialogCtrl",
            size: "md",
            backdrop: "static",
            keyboard: false
        });
        modalInstance.result.then(function(result) {
            if (result) {
                $scope.loading = true;
                $scope.executionError = null;
                $scope.loading = true;
                $scope.error = null;
                $scope.executionError = [];
                CFTestPlanManager.saveTestPlan("hl7v2", $scope.testcase.scope, $scope.token, $scope.getUpdatedProfiles(), $scope.getRemovedProfiles(), $scope.getAddedProfiles(), $scope.testcase).then(function(result) {
                    if (result.status === "SUCCESS") {
                        CFTestPlanManager.publishTestPlan($scope.testcase.groupId).then(function(result) {
                            if (result.status === "SUCCESS") {
                                $scope.selectedNode = $scope.testCases[0];
                                if ($scope.selectedNode != null) {
                                    $scope.selectedNode["name"] = $scope.testcase["name"];
                                    $scope.selectedNode["description"] = $scope.testcase["description"];
                                    var testPlan = $scope.findTestPlan($scope.selectedNode.id, $scope.existingTestPlans);
                                    testPlan.name = $scope.testcase["name"];
                                    testPlan.description = $scope.testcase["description"];
                                    Notification.success({
                                        message: "Profile Group saved successfully!",
                                        templateUrl: "NotificationSuccessTemplate.html",
                                        scope: $rootScope,
                                        delay: 5e3
                                    });
                                    $scope.uploaded = false;
                                    $scope.profileMessages = [];
                                    $scope.profileMessagesTmp = [];
                                    $scope.oldProfileMessages = [];
                                    $scope.tmpNewMessages = [];
                                    $scope.tmpOldMessages = [];
                                    $scope.originalOldProfileMessages = [];
                                    $scope.originalProfileMessages = [];
                                    $scope.selectedScope.key = "GLOBAL";
                                    $scope.selectScope();
                                    $scope.selectGroup($scope.selectedNode);
                                    Notification.success({
                                        message: "Profile Group has been successfully published !",
                                        templateUrl: "NotificationSuccessTemplate.html",
                                        scope: $rootScope,
                                        delay: 5e3
                                    });
                                    $scope.afterSave($scope.token);
                                }
                            } else {
                                $scope.executionError.push(response.debugError);
                            }
                            $scope.loading = false;
                        }, function(error) {
                            $scope.loading = false;
                            $scope.executionError.push(error.data);
                        });
                    }
                }, function(error) {
                    $scope.loading = false;
                    $scope.executionError.push(error.data);
                });
            }
        });
    };
    $scope.saveGroup = function(node) {
        if (node.type === "TestPlan") {
            $scope.saveTestPlan();
        } else {
            $scope.saveTestStepGroup();
        }
    };
    $scope.saveTestPlan = function() {
        $scope.loading = true;
        $scope.error = null;
        $scope.executionError = [];
        CFTestPlanManager.saveTestPlan("hl7v2", $scope.testcase.scope, $scope.token, $scope.getUpdatedProfiles(), $scope.getRemovedProfiles(), $scope.getAddedProfiles(), $scope.testcase).then(function(result) {
            if (result.status === "SUCCESS") {
                $scope.selectedNode = $scope.testCases[0];
                if ($scope.selectedNode != null) {
                    $scope.selectedNode["name"] = $scope.testcase["name"];
                    $scope.selectedNode["description"] = $scope.testcase["description"];
                    var testPlan = $scope.findTestPlan($scope.selectedNode.id, $scope.existingTestPlans);
                    testPlan.name = $scope.testcase["name"];
                    testPlan.description = $scope.testcase["description"];
                    Notification.success({
                        message: "Profile Group saved successfully!",
                        templateUrl: "NotificationSuccessTemplate.html",
                        scope: $rootScope,
                        delay: 5e3
                    });
                    $scope.uploaded = false;
                    $scope.profileMessages = [];
                    $scope.oldProfileMessages = [];
                    $scope.tmpNewMessages = [];
                    $scope.tmpOldMessages = [];
                    $scope.originalOldProfileMessages = [];
                    $scope.originalProfileMessages = [];
                    $scope.selectGroup($scope.selectedNode);
                    $scope.afterSave($scope.token);
                    $scope.token = null;
                }
            } else {
                $scope.executionError = result.message;
            }
            $scope.loading = false;
        }, function(error) {
            $scope.loading = false;
            $scope.executionError = error.data;
        });
    };
    $scope.saveTestStepGroup = function() {
        $scope.loading = true;
        $scope.error = null;
        $scope.executionError = null;
        CFTestPlanManager.saveTestStepGroup("hl7v2", $scope.testcase.scope, $scope.token, $scope.getUpdatedProfiles(), $scope.getRemovedProfiles(), $scope.getAddedProfiles(), $scope.testcase).then(function(result) {
            if (result.status === "SUCCESS") {
                $scope.selectedNode = $scope.findGroup($scope.testcase.groupId, "TestStepGroup", $scope.testCases);
                if ($scope.selectedNode != null) {
                    $scope.selectedNode["name"] = $scope.testcase.name;
                    $scope.selectedNode["description"] = $scope.testcase.description;
                    Notification.success({
                        message: "Profile Group saved successfully!",
                        templateUrl: "NotificationSuccessTemplate.html",
                        scope: $rootScope,
                        delay: 5e3
                    });
                    $scope.uploaded = false;
                    $scope.profileMessages = [];
                    $scope.profileMessagesTmp = [];
                    $scope.oldProfileMessages = [];
                    $scope.tmpNewMessages = [];
                    $scope.tmpOldMessages = [];
                    $scope.originalOldProfileMessages = [];
                    $scope.originalProfileMessages = [];
                    $scope.selectGroup($scope.selectedNode);
                    $scope.afterSave($scope.token);
                    $scope.token = null;
                }
            } else {
                $scope.executionError.push(response.debugError);
            }
            $scope.loading = false;
        }, function(error) {
            $scope.loading = false;
            $scope.executionError.push(error.data);
        });
    };
    $scope.reset = function() {
        $scope.error = null;
        $scope.executionError = [];
        var modalInstance = $modal.open({
            templateUrl: "views/cf/manage/confirm-reset-group.html",
            controller: "ConfirmDialogCtrl",
            size: "md",
            backdrop: "static",
            keyboard: false
        });
        modalInstance.result.then(function(result) {
            if (result) {
                if ($scope.selectedNode != null) {
                    $scope.testcase["name"] = $scope.selectedNode["name"];
                    $scope.testcase["description"] = $scope.selectedNode["description"];
                }
                $scope.profileMessages = angular.copy($scope.originalProfileMessages);
                $scope.tmpNewMessages = $scope.filterMessages($scope.profileMessages);
                if ($scope.tmpNewMessages.length > 0) {
                    for (var i = 0; i < $scope.tmpNewMessages.length; i++) {
                        $scope.tmpNewMessages[i]["position"] = i + 1;
                    }
                }
                $scope.oldProfileMessages = angular.copy($scope.originalOldProfileMessages);
                $scope.tmpOldMessages = $scope.filterMessages($scope.oldProfileMessages);
                if ($scope.token != null && $scope.uploaded == true) {
                    CFTestPlanManager.deleteToken($scope.token);
                    $scope.token = null;
                }
            }
        }, function(result) {});
    };
    $scope.cancelToken = function() {
        $scope.error = null;
        $scope.executionError = [];
        if ($scope.token != null) {
            CFTestPlanManager.deleteToken($scope.token).then(function(result) {
                $scope.token = null;
                $scope.testcase = null;
                $scope.profileMessages = null;
                $scope.originalProfileMessages = null;
                $scope.originalOldProfileMessages = null;
                $scope.oldProfileMessages = null;
                $scope.existingTP = {
                    selected: null
                };
                $scope.selectedTP = {
                    id: null
                };
                $scope.profileValidationErrors = [];
                $scope.valueSetValidationErrors = [];
                $scope.constraintValidationErrors = [];
                $scope.executionError = [];
                Notification.success({
                    message: "Changes removed successfully!",
                    templateUrl: "NotificationSuccessTemplate.html",
                    scope: $rootScope,
                    delay: 5e3
                });
                $scope.afterSave($scope.token);
                $scope.token = null;
            }, function(error) {
                $scope.executionError = error.data;
                $scope.executionError.push(error.data);
            });
        }
    };
    $scope.deleteNewProfile = function(profile) {
        profile["removed"] = true;
        $scope.tmpNewMessages = $scope.filterMessages($scope.profileMessages);
        if ($scope.tmpNewMessages.length > 0) {
            for (var i = 0; i < $scope.tmpNewMessages.length; i++) {
                $scope.tmpNewMessages[i]["position"] = i + 1;
            }
        }
    };
    $scope.deleteOldProfile = function(profile) {
        profile["removed"] = true;
        $scope.tmpOldMessages = $scope.filterMessages($scope.oldProfileMessages);
    };
    $scope.getAddedProfiles = function() {
        return _.reject($scope.profileMessages, function(message) {
            return message.removed == true;
        });
    };
    $scope.getRemovedProfiles = function() {
        return _.reject($scope.oldProfileMessages, function(message) {
            return message.removed == undefined || message.removed == false;
        });
    };
    $scope.getUpdatedProfiles = function() {
        return _.reject($scope.oldProfileMessages, function(message) {
            return message.removed == true;
        });
    };
    $scope.treeOptions = {
        beforeDrop: function(e) {
            $scope.error = null;
            var sourceNode = e.source.nodeScope.$modelValue;
            var destNode = e.dest.nodesScope.node;
            var destPosition = e.dest.index + 1;
            console.log(destNode);
            if (sourceNode != null && destNode != null) {
                return CFTestPlanManager.updateLocation(destNode, sourceNode, destPosition).then(function(result) {
                    if (result.status == "SUCCESS") {
                        return true;
                    } else {
                        $scope.error = "Failed to change profile group " + sourceNode.name + " position ";
                        return false;
                    }
                }, function(error) {
                    $scope.error = "Failed to change profile group " + sourceNode.name + " position ";
                    return false;
                });
            } else {
                return false;
            }
        },
        dropped: function(e) {
            $scope.selectTestPlan();
        }
    };
    $scope.openUploadModal = function() {
        $modalStack.dismissAll("close");
        var modalInstance = $modal.open({
            templateUrl: "views/cf/manage/upload.html",
            controller: "UploadCtrl",
            resolve: {
                isValidationOnly: function() {
                    return false;
                }
            },
            scope: $scope,
            controllerAs: "ctrl",
            windowClass: "upload-modal",
            backdrop: "static",
            keyboard: false
        });
        $scope.close = function(params) {
            modalInstance.close(params);
        };
        $scope.dismissModal = function() {
            modalInstance.dismiss("cancel");
        };
        modalInstance.result.then(function(result, profiles) {
            if (result.token != null) {
                $scope.token = result.token;
                $scope.uploaded = true;
                $scope.originalProfileMessages = [];
                $scope.profileMessages = [];
                for (var i = 0; i < result.profiles.length; i++) {
                    var profile = result.profiles[i];
                    $scope.profileMessages.push(profile);
                }
                $scope.tmpNewMessages = $scope.filterMessages($scope.profileMessages);
                if ($scope.tmpNewMessages.length > 0) {
                    for (var i = 0; i < $scope.tmpNewMessages.length; i++) {
                        $scope.tmpNewMessages[i]["position"] = i + 1;
                    }
                }
            }
        }, function(result) {});
    };
    $scope.editExampleMessage = function(item) {
        $modalStack.dismissAll("close");
        var modalInstance = $modal.open({
            templateUrl: "views/cf/manage/message.html",
            controller: "CFManageExampleMessageCtrl",
            controllerAs: "ctrl",
            windowClass: "upload-modal",
            backdrop: "static",
            keyboard: false,
            resolve: {
                exampleMessage: function() {
                    return item.exampleMessage;
                }
            }
        });
        modalInstance.result.then(function(exampleMessage) {
            item.exampleMessage = exampleMessage;
        }, function(result) {});
    };
} ]);

angular.module("cf").controller("CFManageExampleMessageCtrl", function($scope, $http, $window, $modal, $filter, $rootScope, $timeout, StorageService, FileUploader, Notification, $modalInstance, exampleMessage) {
    $scope.exampleMessage = exampleMessage;
    $scope.save = function() {
        $modalInstance.close($scope.exampleMessage);
    };
    $scope.cancel = function() {
        $modalInstance.dismiss();
    };
});

angular.module("cf").controller("UploadCtrl", [ "$scope", "$http", "$window", "$modal", "$filter", "$rootScope", "$timeout", "StorageService", "TestCaseService", "TestStepService", "FileUploader", "Notification", "userInfoService", "CFTestPlanManager", "isValidationOnly", function($scope, $http, $window, $modal, $filter, $rootScope, $timeout, StorageService, TestCaseService, TestStepService, FileUploader, Notification, userInfoService, CFTestPlanManager, isValidationOnly) {
    FileUploader.FileSelect.prototype.isEmptyAfterSelection = function() {
        return true;
    };
    $scope.step = 0;
    $scope.isValidationOnly = isValidationOnly;
    $scope.profileValidationErrors = [];
    $scope.valueSetValidationErrors = [];
    $scope.constraintValidationErrors = [];
    $scope.profileUploadDone = false;
    $scope.vsUploadDone = false;
    $scope.constraintsUploadDone = false;
    $scope.validationReport = "";
    $scope.executionError = [];
    var profileUploader = $scope.profileUploader = new FileUploader({
        url: "api/cf/hl7v2/management/uploadProfiles",
        autoUpload: false,
        filters: [ {
            name: "xmlFilter",
            fn: function(item) {
                return /\/(xml)$/.test(item.type);
            }
        } ]
    });
    var vsUploader = $scope.vsUploader = new FileUploader({
        url: "api/cf/hl7v2/management/uploadValueSets",
        autoUpload: false,
        filters: [ {
            name: "xmlFilter",
            fn: function(item) {
                return /\/(xml)$/.test(item.type);
            }
        } ]
    });
    var constraintsUploader = $scope.constraintsUploader = new FileUploader({
        url: "api/cf/hl7v2/management/uploadConstraints",
        autoUpload: false,
        filters: [ {
            name: "xmlFilter",
            fn: function(item) {
                return /\/(xml)$/.test(item.type);
            }
        } ]
    });
    var zipUploader = $scope.zipUploader = new FileUploader({
        url: "api/cf/hl7v2/management/uploadZip",
        autoUpload: true,
        filters: [ {
            name: "zipFilter",
            fn: function(item) {
                return /\/(zip)$/.test(item.type);
            }
        } ]
    });
    profileUploader.onErrorItem = function(fileItem, response, status, headers) {
        Notification.error({
            message: "There was an error while uploading " + fileItem.file.name,
            templateUrl: "NotificationErrorTemplate.html",
            scope: $rootScope,
            delay: 1e4
        });
        $scope.step = 1;
    };
    vsUploader.onCompleteItem = function(fileItem, response, status, headers) {
        if (response.success == false) {
            $scope.step = 1;
            $scope.executionError.push(response.debugError);
        } else {
            $scope.vsUploadDone = true;
            if ($scope.vsUploadDone === true && $scope.profileUploadDone === true && $scope.constraintsUploadDone === true) {
                $scope.validatefiles($scope.token);
            }
        }
    };
    constraintsUploader.onCompleteItem = function(fileItem, response, status, headers) {
        if (response.success == false) {
            $scope.step = 1;
            $scope.executionError.push(response.debugError);
        } else {
            $scope.constraintsUploadDone = true;
            if ($scope.vsUploadDone === true && $scope.profileUploadDone === true && $scope.constraintsUploadDone === true) {
                $scope.validatefiles($scope.token);
            }
        }
    };
    profileUploader.onCompleteItem = function(fileItem, response, status, headers) {
        if (response.success == false) {
            $scope.step = 1;
            $scope.executionError.push(response.debugError);
        } else {
            $scope.profileUploadDone = true;
            if ($scope.vsUploadDone === true && $scope.profileUploadDone === true && $scope.constraintsUploadDone === true) {
                $scope.validatefiles($scope.token);
            }
            $scope.profileMessagesTmp = response.profiles;
        }
    };
    profileUploader.onBeforeUploadItem = function(fileItem) {
        $scope.profileValidationErrors = [];
        if ($scope.token == null) {
            $scope.token = $scope.generateUUID();
        }
        fileItem.formData.push({
            token: $scope.token
        });
        fileItem.formData.push({
            domain: $rootScope.domain.domain
        });
    };
    constraintsUploader.onBeforeUploadItem = function(fileItem) {
        $scope.constraintValidationErrors = [];
        if ($scope.token == null) {
            $scope.token = $scope.generateUUID();
        }
        fileItem.formData.push({
            token: $scope.token
        });
        fileItem.formData.push({
            domain: $rootScope.domain.domain
        });
    };
    vsUploader.onBeforeUploadItem = function(fileItem) {
        $scope.valueSetValidationErrors = [];
        if ($scope.token == null) {
            $scope.token = $scope.generateUUID();
        }
        fileItem.formData.push({
            token: $scope.token
        });
        fileItem.formData.push({
            domain: $rootScope.domain.domain
        });
    };
    zipUploader.onBeforeUploadItem = function(fileItem) {
        $scope.profileValidationErrors = [];
        $scope.valueSetValidationErrors = [];
        $scope.constraintValidationErrors = [];
        $scope.validationReport = "";
        $scope.executionError = [];
        fileItem.formData.push({
            token: $scope.token
        });
        fileItem.formData.push({
            domain: $rootScope.domain.domain
        });
    };
    zipUploader.onCompleteItem = function(fileItem, response, status, headers) {
        if ($scope.isValidationOnly) {
            if (response.report !== undefined) {
                $scope.validationReport = response.report;
                $scope.step = 1;
            } else if (response.debugError !== undefined) {
                $scope.executionError.push(response.debugError);
                $scope.step = 1;
            }
        } else if (response.success == false) {
            if (response.debugError === undefined) {
                Notification.error({
                    message: "The zip file you uploaded is not valid, please check and correct the error(s) and try again",
                    templateUrl: "NotificationErrorTemplate.html",
                    scope: $rootScope,
                    delay: 1e4
                });
                $scope.validationReport = response.report;
                $scope.step = 1;
            } else {
                $scope.executionError.push(response.debugError);
                $scope.step = 1;
            }
        } else {
            $scope.token = response.token;
            CFTestPlanManager.getTokenProfiles("hl7v2", $scope.token).then(function(response) {
                if (response.success == false) {
                    if (response.debugError === undefined) {
                        Notification.error({
                            message: "The zip file you uploaded is not valid, please check and correct the error(s)",
                            templateUrl: "NotificationErrorTemplate.html",
                            scope: $rootScope,
                            delay: 1e4
                        });
                        $scope.step = 1;
                        $scope.validationReport = response.report;
                    } else {
                        Notification.error({
                            message: "  " + response.message + "<br>" + response.debugError,
                            templateUrl: "NotificationErrorTemplate.html",
                            scope: $rootScope,
                            delay: 1e4
                        });
                        $scope.step = 1;
                    }
                } else {
                    $scope.profileMessages = response.profiles;
                    $scope.addSelectedTestCases();
                }
            }, function(response) {});
        }
    };
    $scope.gotStep = function(step) {
        $scope.step = step;
    };
    profileUploader.onAfterAddingAll = function(fileItem) {
        if (profileUploader.queue.length > 1) {
            profileUploader.removeFromQueue(0);
        }
    };
    vsUploader.onAfterAddingAll = function(fileItem) {
        if (vsUploader.queue.length > 1) {
            vsUploader.removeFromQueue(0);
        }
    };
    constraintsUploader.onAfterAddingAll = function(fileItem) {
        if (constraintsUploader.queue.length > 1) {
            constraintsUploader.removeFromQueue(0);
        }
    };
    $scope.getSelectedTestcases = function() {
        return $scope.profileMessages;
    };
    $scope.validatefiles = function(token) {
        $scope.loading = true;
        $http.get("api/cf/hl7v2/management/validate", {
            params: {
                token: token
            }
        }).then(function(response) {
            if (response.data.success == true) {
                $scope.profileMessages = $scope.profileMessagesTmp;
                $scope.profileMessagesTmp = [];
                $scope.addSelectedTestCases();
            } else {
                $scope.profileMessagesTmp = [];
                $scope.step = 1;
                if (response.data.report) {
                    $scope.validationReport = response.data.report;
                }
                if (response.data.debugError) {
                    $scope.executionError.push(response.data.debugError);
                }
            }
            $scope.loading = false;
        }, function(response) {
            $scope.profileMessagesTmp = [];
            $scope.step = 1;
            $scope.executionError.push(response.data.debugError);
            $scope.loading = false;
        });
    };
    $scope.upload = function(value) {
        $scope.step = 0;
        $scope.token = $scope.generateUUID();
        $scope.profileValidationErrors = [];
        $scope.valueSetValidationErrors = [];
        $scope.constraintValidationErrors = [];
        $scope.validationReport = "";
        $scope.executionError = [];
        $scope.profileUploadDone = false;
        $scope.vsUploadDone = false;
        $scope.constraintsUploadDone = false;
        vsUploader.uploadAll();
        constraintsUploader.uploadAll();
        profileUploader.uploadAll();
    };
    $scope.clear = function(value) {
        $scope.profileValidationErrors = [];
        $scope.valueSetValidationErrors = [];
        $scope.constraintValidationErrors = [];
        $scope.validationReport = "";
        $scope.executionError = [];
        $scope.profileUploadDone = false;
        $scope.vsUploadDone = false;
        $scope.constraintsUploadDone = false;
        profileUploader.clearQueue();
        vsUploader.clearQueue();
        constraintsUploader.clearQueue();
    };
    $scope.addSelectedTestCases = function() {
        $scope.loading = true;
        Notification.success({
            message: "Profile Added !",
            templateUrl: "NotificationSuccessTemplate.html",
            scope: $rootScope,
            delay: 5e3
        });
        $scope.close({
            token: $scope.token,
            profiles: $scope.getSelectedTestcases()
        });
    };
    $scope.getTotalProgress = function() {
        var numberOfactiveQueue = 0;
        var progress = 0;
        if (profileUploader.queue.length > 0) {
            numberOfactiveQueue++;
            progress += profileUploader.progress;
        }
        if (vsUploader.queue.length > 0) {
            numberOfactiveQueue++;
            progress += vsUploader.progress;
        }
        if (constraintsUploader.queue.length > 0) {
            numberOfactiveQueue++;
            progress += constraintsUploader.progress;
        }
        return progress / numberOfactiveQueue;
    };
    $scope.generateUUID = function() {
        var d = new Date().getTime();
        var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == "x" ? r : r & 3 | 8).toString(16);
        });
        return uuid;
    };
} ]);

angular.module("cf").controller("UploadTokenCheckCtrl", [ "$scope", "$http", "CF", "$window", "$modal", "$filter", "$rootScope", "$timeout", "StorageService", "TestCaseService", "TestStepService", "userInfoService", "Notification", "modalService", "$routeParams", "$location", function($scope, $http, CF, $window, $modal, $filter, $rootScope, $timeout, StorageService, TestCaseService, TestStepService, userInfoService, Notification, modalService, $routeParams, $location) {
    $scope.testcase = {};
    $scope.profileValidationErrors = [];
    $scope.valueSetValidationErrors = [];
    $scope.constraintValidationErrors = [];
    $scope.profileCheckToggleStatus = false;
    $scope.token = decodeURIComponent($routeParams.x);
    $scope.auth = decodeURIComponent($routeParams.y);
    $scope.domain = decodeURIComponent($routeParams.d);
    if ($scope.token !== undefined && $scope.auth !== undefined) {
        if (!userInfoService.isAuthenticated()) {
            $scope.$emit("event:loginRequestWithAuth", $scope.auth, "/addprofiles?x=" + $scope.token + "&d=" + $scope.domain);
        } else {
            $location.url("/addprofiles?x=" + $scope.token + "&d=" + $scope.domain);
        }
    }
} ]);

angular.module("cf").controller("CreateTestPlanCtrl", function($scope, $modalInstance, scope, CFTestPlanManager, position, domain) {
    $scope.newGroup = {
        name: null,
        description: null,
        scope: scope,
        domain: domain,
        position: position
    };
    $scope.error = null;
    $scope.loading = false;
    $scope.submit = function() {
        if ($scope.newGroup.name != null && $scope.newGroup.name != "" && $scope.newGroup.domain != null && $scope.newGroup.domain != "") {
            $scope.error = null;
            $scope.loading = true;
            CFTestPlanManager.createTestPlan($scope.newGroup).then(function(testPlan) {
                $scope.loading = false;
                $modalInstance.close(testPlan);
            }, function(error) {
                $scope.loading = false;
                $scope.error = "Sorry, Cannot create a new profile group. Please try again";
            });
        }
    };
    $scope.cancel = function() {
        $modalInstance.dismiss("cancel");
    };
});

angular.module("cf").controller("CreateTestStepGroupCtrl", function($scope, $modalInstance, scope, CFTestPlanManager, position, domain, parentNode) {
    $scope.newGroup = {
        name: null,
        description: null,
        scope: scope,
        domain: domain,
        position: position
    };
    $scope.error = null;
    $scope.loading = false;
    $scope.submit = function() {
        if ($scope.newGroup.name != null && $scope.newGroup.name != "" && $scope.newGroup.domain != null && $scope.newGroup.domain != "") {
            $scope.error = null;
            $scope.loading = true;
            CFTestPlanManager.addChild($scope.newGroup, parentNode).then(function(group) {
                $scope.loading = false;
                $modalInstance.close(group);
            }, function(error) {
                $scope.error = "Sorry, Cannot create a new profile group. Please try again";
            });
        }
    };
    $scope.cancel = function() {
        $modalInstance.dismiss("cancel");
    };
});

"use strict";

angular.module("cb").controller("CBTestingCtrl", [ "$scope", "$window", "$rootScope", "CB", "StorageService", "$timeout", "TestCaseService", "TestStepService", "$routeParams", "userInfoService", function($scope, $window, $rootScope, CB, StorageService, $timeout, TestCaseService, TestStepService, $routeParams, userInfoService) {
    $scope.cb = CB;
    $scope.testCase = null;
    $scope.token = $routeParams.x;
    $scope.domain = $routeParams.d;
    $scope.initTesting = function() {
        if ($routeParams.scope !== undefined && $routeParams.group !== undefined) {
            StorageService.set(StorageService.CB_SELECTED_TESTPLAN_ID_KEY, $routeParams.group);
            StorageService.set(StorageService.CB_SELECTED_TESTPLAN_SCOPE_KEY, $routeParams.scope);
            $scope.setSubActive("/cb_testcase", $routeParams.scope, $routeParams.group);
        } else {
            var tab = StorageService.get(StorageService.ACTIVE_SUB_TAB_KEY);
            if (tab == null || tab !== "/cb_execution" && tab !== "/cb_management") tab = "/cb_testcase";
            $scope.setSubActive(tab);
        }
        $scope.$on("cb:testCaseLoaded", function(event, testCase, tab) {
            $scope.testCase = testCase;
        });
    };
    $scope.setSubActive = function(tab, scope, group) {
        $rootScope.setSubActive(tab);
        $timeout(function() {
            if (tab === "/cb_execution") {
                $scope.$broadcast("cb:refreshEditor");
                $rootScope.$broadcast("event:refreshLoadedTestCase");
            } else if (tab === "/cb_testcase") {
                if (scope !== undefined && group !== undefined) {
                    $scope.$broadcast("event:cb:initTestCase", {
                        scope: scope,
                        group: group
                    });
                } else {
                    $scope.$broadcast("event:cb:initTestCase");
                }
            } else if (tab === "/cb_management") {
                $scope.$broadcast("event:cb:initManagement");
            }
        }, 500);
    };
} ]);

angular.module("cb").controller("CBExecutionCtrl", [ "$scope", "$window", "$rootScope", "CB", "$modal", "TestExecutionClock", "Endpoint", "TestExecutionService", "$timeout", "StorageService", "User", "ReportService", "TestCaseDetailsService", "$compile", "Transport", "$filter", "SOAPEscaper", "Notification", function($scope, $window, $rootScope, CB, $modal, TestExecutionClock, Endpoint, TestExecutionService, $timeout, StorageService, User, ReportService, TestCaseDetailsService, $compile, Transport, $filter, SOAPEscaper, Notification) {
    $scope.cb = CB;
    $scope.targ = "cb-executed-test-step";
    $scope.loading = false;
    $scope.error = null;
    $scope.tabs = new Array();
    $scope.testCase = null;
    $scope.testStep = null;
    $scope.logger = CB.logger;
    $scope.connecting = false;
    $scope.transport = Transport;
    $scope.endpoint = null;
    $scope.hidePwd = true;
    $scope.sent = null;
    $scope.received = null;
    $scope.configCollapsed = true;
    $scope.counterMax = $scope.transport.getTimeout();
    $scope.counter = 0;
    $scope.listenerReady = false;
    $scope.testStepListCollapsed = false;
    $scope.warning = null;
    $scope.sutInititiatorForm = "";
    $scope.taInititiatorForm = "";
    $scope.user = User;
    $scope.domain = null;
    $scope.protocol = StorageService.get(StorageService.TRANSPORT_PROTOCOL) != null && StorageService.get(StorageService.TRANSPORT_PROTOCOL) != undefined ? StorageService.get(StorageService.TRANSPORT_PROTOCOL) : null;
    $scope.exampleMessageEditor = null;
    $scope.testExecutionService = TestExecutionService;
    $scope.loadingExecution = false;
    $scope.saveButtonText = "Save Test Case Report";
    $scope.initExecution = function() {
        $scope.$on("cb:testCaseLoaded", function(event, testCase, tab) {
            $scope.executeTestCase(testCase, tab);
        });
    };
    var errors = [ "Incorrect message Received. Please check the log for more details", "No Outbound message found", "Invalid message Received. Please see console for more details.", "Invalid message Sent. Please see console for more details." ];
    var parseRequest = function(incoming, protocol) {
        if (protocol === "soap") {
            if (incoming != null && incoming != "") {
                var x2js = new X2JS();
                var json = x2js.xml_str2json(incoming);
                if (json.Envelope.Body.submitSingleMessage && json.Envelope.Body.submitSingleMessage.hl7Message) {
                    var hl7Message = SOAPEscaper.decodeXml(json.Envelope.Body.submitSingleMessage.hl7Message.toString());
                    return hl7Message;
                }
            }
        }
        return incoming;
    };
    var parseResponse = function(outbound, protocol) {
        if (protocol === "soap") {
            if (outbound != null && outbound != "") {
                var x2js = new X2JS();
                var json = x2js.xml_str2json(outbound);
                if (json.Envelope.Body.submitSingleMessageResponse && json.Envelope.Body.submitSingleMessageResponse.return) {
                    var hl7Message = SOAPEscaper.decodeXml(json.Envelope.Body.submitSingleMessageResponse.return.toString());
                    return hl7Message;
                }
            }
        }
        return outbound;
    };
    $scope.setTestStepExecutionTab = function(value) {
        $scope.tabs[0] = false;
        $scope.tabs[1] = false;
        $scope.tabs[2] = false;
        $scope.tabs[3] = false;
        $scope.tabs[4] = false;
        $scope.tabs[5] = false;
        $scope.tabs[6] = false;
        $scope.tabs[7] = false;
        $scope.tabs[8] = false;
        $scope.tabs[9] = false;
        $scope.activeTab = value;
        $scope.tabs[$scope.activeTab] = true;
        if ($scope.activeTab === 5) {
            $scope.buildExampleMessageEditor();
        } else if ($scope.activeTab === 6) {
            $scope.loadArtifactHtml("jurorDocument");
        } else if ($scope.activeTab === 7) {
            $scope.loadArtifactHtml("messageContent");
        } else if ($scope.activeTab === 8) {
            $scope.loadArtifactHtml("testDataSpecification");
        } else if ($scope.activeTab === 9) {
            $scope.loadArtifactHtml("testStory");
        }
    };
    $scope.isTestCase = function() {
        return CB.testCase != null && CB.testCase.type === "TestCase";
    };
    $scope.getTestType = function() {
        return CB.testCase.type;
    };
    $scope.disabled = function() {
        return CB.testCase == null || CB.testCase.id === null;
    };
    $scope.getTestType = function() {
        return $scope.testCase != null ? $scope.testCase.type : "";
    };
    $scope.loadTestStepDetails = function(testStep) {
        var tsId = $scope.targ + "-testStory";
        var jDocId = $scope.targ + "-jurorDocument";
        var mcId = $scope.targ + "-messageContent";
        var tdsId = $scope.targ + "-testDataSpecification";
        TestCaseDetailsService.removeHtml(tdsId);
        TestCaseDetailsService.removeHtml(mcId);
        TestCaseDetailsService.removeHtml(jDocId);
        TestCaseDetailsService.removeHtml(tsId);
        $scope.$broadcast(tsId, testStep["testStory"], testStep.name + "-TestStory");
        $scope.$broadcast(jDocId, testStep["jurorDocument"], testStep.name + "-JurorDocument");
        $scope.$broadcast(mcId, testStep["messageContent"], testStep.name + "-MessageContent");
        $scope.$broadcast(tdsId, testStep["testDataSpecification"], testStep.name + "-TestDataSpecification");
        if ($scope.isManualStep(testStep)) {
            $scope.setTestStepExecutionTab(1);
        }
    };
    $scope.loadTestStepExecutionPanel = function(testStep) {
        $scope.exampleMessageEditor = null;
        $scope.detailsError = null;
        var testContext = testStep["testContext"];
        if (testContext && testContext != null) {
            $scope.setTestStepExecutionTab(0);
            $scope.$broadcast("cb:testStepLoaded", testStep);
            $scope.$broadcast("cb:profileLoaded", testContext.profile);
            $scope.$broadcast("cb:valueSetLibraryLoaded", testContext.vocabularyLibrary);
            TestCaseDetailsService.removeHtml($scope.targ + "-exampleMessage");
            var exampleMessage = testContext.message && testContext.message.content && testContext.message.content != null ? testContext.message.content : null;
            if (exampleMessage != null) {
                $scope.$broadcast($scope.targ + "-exampleMessage", exampleMessage, testContext.format, testStep.name);
            }
        } else {
            $scope.setTestStepExecutionTab(1);
            var result = TestExecutionService.getTestStepValidationReport(testStep);
            $rootScope.$emit("cbManual:updateTestStepValidationReport", result != undefined && result != null ? result.reportId : null, testStep, $scope.isTestCase());
        }
        var exampleMsgId = $scope.targ + "-exampleMessage";
        TestCaseDetailsService.details("cb", "TestStep", testStep.id).then(function(result) {
            testStep["testStory"] = result["testStory"];
            testStep["jurorDocument"] = result["jurorDocument"];
            testStep["testDataSpecification"] = result["testDataSpecification"];
            testStep["messageContent"] = result["messageContent"];
            $scope.loadTestStepDetails(testStep);
            $scope.detailsError = null;
        }, function(error) {
            testStep["testStory"] = null;
            testStep["testPackage"] = null;
            testStep["jurorDocument"] = null;
            testStep["testDataSpecification"] = null;
            testStep["messageContent"] = null;
            $scope.loadTestStepDetails(testStep);
            $scope.detailsError = "Sorry, could not load the test step details. Please try again";
        });
    };
    $scope.buildExampleMessageEditor = function() {
        var eId = $scope.targ + "-exampleMessage";
        if ($scope.exampleMessageEditor === null || !$scope.exampleMessageEditor) {
            $timeout(function() {
                $scope.exampleMessageEditor = TestCaseDetailsService.buildExampleMessageEditor(eId, $scope.testStep.testContext.message.content, $scope.exampleMessageEditor, $scope.testStep.testContext && $scope.testStep.testContext != null ? $scope.testStep.testContext.format : null);
            }, 100);
        }
        $timeout(function() {
            if ($("#" + eId)) {
                $("#" + eId).scrollLeft();
            }
        }, 1e3);
    };
    $scope.loadArtifactHtml = function(key) {
        if ($scope.testStep != null) {
            var element = TestCaseDetailsService.loadArtifactHtml($scope.targ + "-" + key, $scope.testStep[key]);
            if (element && element != null) {
                $compile(element.contents())($scope);
            }
        }
    };
    $scope.resetTestCase = function() {
        if ($scope.testCase != null) {
            $scope.loadingExecution = true;
            $scope.error = null;
            TestExecutionService.clear($scope.testCase.id).then(function(res) {
                $scope.loadingExecution = false;
                $scope.error = null;
                if (CB.editor != null && CB.editor.instance != null) {
                    CB.editor.instance.setOption("readOnly", false);
                }
                StorageService.remove(StorageService.CB_LOADED_TESTSTEP_TYPE_KEY);
                StorageService.remove(StorageService.CB_LOADED_TESTSTEP_ID_KEY);
                $scope.executeTestCase($scope.testCase);
            }, function(error) {
                $scope.loadingExecution = false;
                $scope.error = null;
            });
        }
    };
    $scope.selectProtocol = function(testStep) {
        if (testStep != null) {
            $scope.protocol = testStep.protocol;
            StorageService.set(StorageService.TRANSPORT_PROTOCOL, $scope.protocol);
        }
    };
    $scope.selectTestStep = function(testStep) {
        CB.testStep = testStep;
        $scope.testStep = testStep;
        if (testStep != null) {
            StorageService.set(StorageService.CB_LOADED_TESTSTEP_TYPE_KEY, $scope.testStep.type);
            StorageService.set(StorageService.CB_LOADED_TESTSTEP_ID_KEY, $scope.testStep.id);
            if (!$scope.isManualStep(testStep)) {
                if ($scope.testExecutionService.getTestStepExecutionMessage(testStep) === undefined && testStep["testingType"] === "TA_INITIATOR") {
                    if (!$scope.transport.disabled && $scope.domain != null && $scope.protocol != null) {
                        var populateMessage = $scope.transport.populateMessage(testStep.id, testStep.testContext.message.content, $scope.domain, $scope.protocol);
                        populateMessage.then(function(response) {
                            $scope.testExecutionService.setTestStepExecutionMessage(testStep, response.outgoingMessage);
                            $scope.loadTestStepExecutionPanel(testStep);
                        }, function(error) {
                            $scope.testExecutionService.setTestStepExecutionMessage(testStep, testStep.testContext.message.content);
                            $scope.loadTestStepExecutionPanel(testStep);
                        });
                    } else {
                        var con = $scope.testExecutionService.getTestStepExecutionMessage(testStep);
                        con = con != null && con != undefined ? con : testStep.testContext.message.content;
                        $scope.testExecutionService.setTestStepExecutionMessage(testStep, con);
                        $scope.loadTestStepExecutionPanel(testStep);
                    }
                } else if ($scope.testExecutionService.getTestStepExecutionMessage(testStep) === undefined && testStep["testingType"] === "TA_RESPONDER" && $scope.transport.disabled) {
                    $scope.testExecutionService.setTestStepExecutionMessage(testStep, testStep.testContext.message.content);
                    $scope.loadTestStepExecutionPanel(testStep);
                } else {
                    $scope.loadTestStepExecutionPanel(testStep);
                }
            } else {
                $scope.loadTestStepExecutionPanel(testStep);
            }
        }
    };
    $scope.viewTestStepResult = function(testStep) {
        CB.testStep = testStep;
        $scope.testStep = testStep;
        if (testStep != null) {
            StorageService.set(StorageService.CB_LOADED_TESTSTEP_TYPE_KEY, $scope.testStep.type);
            StorageService.set(StorageService.CB_LOADED_TESTSTEP_ID_KEY, $scope.testStep.id);
            $scope.loadTestStepExecutionPanel(testStep);
        }
    };
    $scope.clearTestStep = function() {
        CB.testStep = null;
        $scope.testStep = null;
        $scope.$broadcast("cb:removeTestStep");
    };
    $scope.getTestStepExecutionStatus = function(testStep) {
        return $scope.testExecutionService.getTestStepExecutionStatus(testStep);
    };
    $scope.getTestStepValidationResult = function(testStep) {
        return $scope.testExecutionService.getTestStepValidationResult(testStep);
    };
    $scope.getTestStepValidationReport = function(testStep) {
        return $scope.testExecutionService.getTestStepValidationReport(testStep);
    };
    $scope.getManualValidationStatusTitle = function(testStep) {
        return $scope.testExecutionService.getManualValidationStatusTitle(testStep);
    };
    $scope.isManualStep = function(testStep) {
        return testStep != null && (testStep["testingType"] === "TA_MANUAL" || testStep["testingType"] === "SUT_MANUAL");
    };
    $scope.isSutInitiator = function(testStep) {
        return testStep["testingType"] == "SUT_INITIATOR";
    };
    $scope.isTaInitiator = function(testStep) {
        return testStep["testingType"] == "TA_INITIATOR";
    };
    $scope.isTestStepCompleted = function(testStep) {
        return $scope.testExecutionService.getTestStepExecutionStatus(testStep) === "COMPLETE";
    };
    $scope.completeStep = function(row) {
        $scope.testExecutionService.setTestStepExecutionStatus(row, "COMPLETE");
    };
    $scope.completeManualStep = function(row) {
        $scope.completeStep(row);
    };
    $scope.progressStep = function(row) {
        $scope.testExecutionService.setTestStepExecutionStatus(row, "IN_PROGRESS");
    };
    $scope.goNext = function(row) {
        if (row != null && row) {
            if (!$scope.isLastStep(row)) {
                $scope.executeTestStep($scope.findNextStep(row.position));
            } else {
                $scope.completeTestCase();
            }
        }
    };
    $scope.goBack = function(row) {
        if (row != null && row) {
            if (!$scope.isFirstStep(row)) {
                $scope.executeTestStep($scope.findPreviousStep(row.position));
            }
        }
    };
    $scope.executeTestStep = function(testStep) {
        if (testStep != null && testStep != undefined) {
            $scope.testExecutionService.testStepCommentsChanged[testStep.id] = false;
            TestExecutionService.setTestStepValidationReport(testStep, null);
            CB.testStep = testStep;
            $scope.warning = null;
            if ($scope.isManualStep(testStep) || testStep.testingType === "TA_RESPONDER") {
                $scope.completeStep(testStep);
            }
            testStep.protocol = null;
            $scope.protocol = null;
            if (testStep.protocols != null && testStep.protocols && testStep.protocols.length > 0) {
                var protocol = StorageService.get(StorageService.TRANSPORT_PROTOCOL) != null && StorageService.get(StorageService.TRANSPORT_PROTOCOL) != undefined ? StorageService.get(StorageService.TRANSPORT_PROTOCOL) : null;
                protocol = protocol != null && testStep.protocols.indexOf(protocol) > 0 ? protocol : null;
                protocol = protocol != null ? protocol : $scope.getDefaultProtocol(testStep);
                testStep["protocol"] = protocol;
                $scope.selectProtocol(testStep);
            }
            var log = $scope.transport.logs[testStep.id];
            $scope.logger.content = log && log != null ? log : "";
            $scope.selectTestStep(testStep);
        }
    };
    $scope.getDefaultProtocol = function(testStep) {
        if (testStep.protocols != null && testStep.protocols && testStep.protocols.length > 0) {
            testStep.protocols = $filter("orderBy")(testStep.protocols, "position");
            for (var i = 0; i < testStep.protocols.length; i++) {
                if (testStep.protocols[i]["defaut"] != undefined && testStep.protocols[i]["defaut"] === true) {
                    return testStep.protocols[i].value;
                }
            }
            return testStep.protocols[0].value;
        }
        return null;
    };
    $scope.completeTestCase = function() {
        StorageService.remove(StorageService.CB_LOADED_TESTSTEP_ID_KEY);
        $scope.testExecutionService.setTestCaseExecutionStatus($scope.testCase, "COMPLETE");
        if (CB.editor.instance != null) {
            CB.editor.instance.setOption("readOnly", true);
        }
        TestExecutionService.setTestCaseValidationResultFromTestSteps($scope.testCase);
        $scope.clearTestStep();
        $scope.selectTestStep(null);
    };
    $scope.isTestCaseCompleted = function() {
        return $scope.testExecutionService.getTestCaseExecutionStatus($scope.testCase) === "COMPLETE";
    };
    $scope.shouldNextStep = function(row) {
        return $scope.testStep != null && $scope.testStep === row && !$scope.isTestCaseCompleted() && !$scope.isLastStep(row) && $scope.isTestStepCompleted(row);
    };
    $scope.isLastStep = function(row) {
        return row && row != null && $scope.testCase != null && $scope.testCase.children.length === row.position;
    };
    $scope.isFirstStep = function(row) {
        return row && row != null && $scope.testCase != null && row.position === 1;
    };
    $scope.isTestCaseSuccessful = function() {
        var status = $scope.testExecutionService.getTestCaseValidationResult($scope.testCase);
        return status === "PASSED";
    };
    $scope.isTestStepValidated = function(testStep) {
        return $scope.testExecutionService.getTestStepValidationResult(testStep) != undefined;
    };
    $scope.isTestStepSuccessful = function(testStep) {
        var status = $scope.testExecutionService.getTestStepValidationResult(testStep);
        return status == "PASSED" || "PASSED_NOTABLE_EXCEPTION" ? true : false;
    };
    $scope.findNextStep = function(position) {
        var nextStep = null;
        for (var i = 0; i < $scope.testCase.children.length; i++) {
            if ($scope.testCase.children[i].position === position + 1) {
                return $scope.testCase.children[i];
            }
        }
        return null;
    };
    $scope.findPreviousStep = function(position) {
        var nextStep = null;
        for (var i = 0; i < $scope.testCase.children.length; i++) {
            if ($scope.testCase.children[i].position === position - 1) {
                return $scope.testCase.children[i];
            }
        }
        return null;
    };
    $scope.clearExecution = function() {
        if (CB.editor != null && CB.editor.instance != null) {
            CB.editor.instance.setOption("readOnly", false);
        }
        $scope.loadingExecution = true;
        $scope.error = null;
        TestExecutionService.clear($scope.testCase).then(function(res) {
            $scope.loadingExecution = false;
            $scope.error = null;
        }, function(error) {
            $scope.loadingExecution = false;
            $scope.error = null;
        });
    };
    $scope.setNextStepMessage = function(message) {
        var nextStep = $scope.findNextStep($scope.testStep.position);
        if (nextStep != null && !$scope.isManualStep(nextStep)) {
            $scope.completeStep(nextStep);
            $scope.testExecutionService.setTestStepExecutionMessage(nextStep, message);
        }
    };
    $scope.log = function(log) {
        $scope.logger.log(log);
    };
    $scope.isValidConfig = function() {};
    $scope.outboundMessage = function() {
        return $scope.testStep != null ? $scope.testStep.testContext.message.content : null;
    };
    $scope.hasUserContent = function() {
        return CB.editor && CB.editor != null && CB.editor.instance.doc.getValue() != null && CB.editor.instance.doc.getValue() != "";
    };
    $scope.hasRequestContent = function() {
        return $scope.outboundMessage() != null && $scope.outboundMessage() != "";
    };
    $scope.saveTransportLog = function() {
        $timeout(function() {
            $scope.transport.saveTransportLog($scope.testStep.id, $scope.logger.content, $scope.domain, $scope.protocol);
        });
    };
    $scope.send = function() {
        $scope.connecting = true;
        $scope.openConsole($scope.testStep);
        $scope.logger.clear();
        $scope.progressStep($scope.testStep);
        $scope.error = null;
        if ($scope.hasUserContent()) {
            $scope.received = "";
            $scope.logger.log("Sending outbound Message. Please wait...");
            $scope.transport.send($scope.testStep.id, CB.editor.instance.doc.getValue(), $scope.domain, $scope.protocol).then(function(response) {
                var received = response.incoming;
                var sent = response.outgoing;
                $scope.logger.log("Outbound Message  -------------------------------------->");
                if (sent != null && sent != "") {
                    $scope.logger.log(sent);
                    $scope.logger.log("Inbound Message  <--------------------------------------");
                    if (received != null && received != "") {
                        try {
                            $scope.completeStep($scope.testStep);
                            var rspMessage = parseResponse(received, $scope.protocol);
                            $scope.logger.log(received);
                            var nextStep = $scope.findNextStep($scope.testStep.position);
                            if (nextStep != null && nextStep.testingType === "SUT_RESPONDER") {
                                $scope.setNextStepMessage(rspMessage);
                            }
                        } catch (error) {
                            $scope.error = errors[0];
                            $scope.logger.log("An error occured: " + $scope.error);
                        }
                    } else {
                        $scope.logger.log("No Inbound message received");
                    }
                } else {
                    $scope.logger.log("No outbound message sent");
                }
                $scope.connecting = false;
                $scope.transport.logs[$scope.testStep.id] = $scope.logger.content;
                $scope.logger.log("Transaction completed");
                $scope.saveTransportLog();
            }, function(error) {
                $scope.connecting = false;
                $scope.error = error.data;
                $scope.logger.log("Error: " + error.data);
                $scope.received = "";
                $scope.completeStep($scope.testStep);
                $scope.transport.logs[$scope.testStep.id] = $scope.logger.content;
                $scope.logger.log("Transaction stopped");
                $scope.saveTransportLog();
            });
        } else {
            $scope.error = "No message to send";
            $scope.connecting = false;
            $scope.transport.logs[$scope.testStep.id] = $scope.logger.content;
            $scope.logger.log("Transaction completed");
            $scope.saveTransportLog();
        }
    };
    $scope.viewConsole = function(testStep) {
        if ($scope.consoleDlg && $scope.consoleDlg !== null && $scope.consoleDlg.opened) {
            $scope.consoleDlg.dismiss("cancel");
        }
        $scope.consoleDlg = $modal.open({
            templateUrl: "PastTestStepConsole.html",
            controller: "PastTestStepConsoleCtrl",
            windowClass: "console-modal",
            size: "sm",
            animation: true,
            keyboard: true,
            backdrop: true,
            resolve: {
                log: function() {
                    return $scope.transport.logs[testStep.id];
                },
                title: function() {
                    return testStep.name;
                }
            }
        });
    };
    $scope.openConsole = function(testStep) {
        if ($scope.consoleDlg && $scope.consoleDlg !== null && $scope.consoleDlg.opened) {
            $scope.consoleDlg.dismiss("cancel");
        }
        $scope.consoleDlg = $modal.open({
            templateUrl: "CurrentTestStepConsole.html",
            controller: "CurrentTestStepConsoleCtrl",
            windowClass: "console-modal",
            size: "lg",
            animation: true,
            keyboard: true,
            backdrop: true,
            resolve: {
                logger: function() {
                    return $scope.logger;
                },
                title: function() {
                    return testStep.name;
                }
            }
        });
    };
    $scope.stopListener = function() {
        $scope.connecting = false;
        $scope.counter = $scope.counterMax;
        TestExecutionClock.stop();
        $scope.logger.log("Stopping listener. Please wait....");
        $scope.transport.stopListener($scope.testStep.id, $scope.domain, $scope.protocol).then(function(response) {
            $scope.logger.log("Listener stopped.");
            $scope.transport.logs[$scope.testStep.id] = $scope.logger.content;
            $scope.saveTransportLog();
        }, function(error) {
            $scope.saveTransportLog();
        });
    };
    $scope.updateTestStepValidationReport = function(testStep) {
        $scope.saveButtonDisabled = false;
        $scope.saveButtonText = "Save Test Case Report";
        StorageService.set("testStepValidationResults", angular.toJson(TestExecutionService.testStepValidationResults));
        StorageService.set("testStepComments", angular.toJson(TestExecutionService.testStepComments));
        if ($scope.testStep === null || testStep.id !== $scope.testStep.id) {
            TestExecutionService.updateTestStepValidationReport(testStep);
        } else {
            var reportType = testStep.testContext && testStep.testContext != null ? "cbValidation" : "cbManual";
            var result = TestExecutionService.getTestStepValidationReport(testStep);
            $rootScope.$emit(reportType + ":updateTestStepValidationReport", result && result != null ? result : null, testStep, $scope.getTestType());
        }
    };
    $scope.abortListening = function() {
        $scope.testExecutionService.deleteTestStepExecutionStatus($scope.testStep);
        $scope.stopListener();
    };
    $scope.completeListening = function() {
        $scope.completeStep($scope.testStep);
        $scope.stopListener();
    };
    $scope.setTimeout = function(value) {
        $scope.transport.setTimeout(value);
        $scope.counterMax = value;
    };
    $scope.startListener = function() {
        $scope.openConsole($scope.testStep);
        var nextStep = $scope.findNextStep($scope.testStep.position);
        if (nextStep != null) {
            var rspMessageId = nextStep.testContext.message.id;
            $scope.configCollapsed = false;
            $scope.logger.clear();
            $scope.counter = 0;
            $scope.connecting = true;
            $scope.error = null;
            $scope.warning = null;
            $scope.progressStep($scope.testStep);
            $scope.logger.log("Starting listener. Please wait...");
            $scope.transport.startListener($scope.testStep.id, rspMessageId, $scope.domain, $scope.protocol).then(function(started) {
                if (started) {
                    $scope.logger.log("Listener started.");
                    var execute = function() {
                        var remaining = parseInt($scope.counterMax) - parseInt($scope.counter);
                        if (remaining % 20 === 0) {
                            $scope.logger.log("Waiting for Inbound Message....Remaining time:" + remaining + "s");
                        }
                        ++$scope.counter;
                        var sutInitiator = null;
                        try {
                            sutInitiator = $scope.transport.configs[$scope.protocol].data.sutInitiator;
                        } catch (e) {
                            sutInitiator = null;
                        }
                        $scope.transport.searchTransaction($scope.testStep.id, sutInitiator, rspMessageId, $scope.domain, $scope.protocol).then(function(transaction) {
                            if (transaction != null) {
                                var incoming = transaction.incoming;
                                var outbound = transaction.outgoing;
                                $scope.logger.log("Inbound message received <-------------------------------------- ");
                                if (incoming != null && incoming != "") {
                                    try {
                                        var receivedMessage = parseRequest(incoming, $scope.protocol);
                                        $scope.log(receivedMessage);
                                        $scope.testExecutionService.setTestStepExecutionMessage($scope.testStep, receivedMessage);
                                        $scope.$broadcast("cb:loadEditorContent", receivedMessage);
                                    } catch (error) {
                                        $scope.error = errors[2];
                                        $scope.logger.log("Incorrect Inbound message type");
                                    }
                                } else {
                                    $scope.logger.log("Incoming message received is empty");
                                }
                                $scope.logger.log("Outbound message sent --------------------------------------> ");
                                if (outbound != null && outbound != "") {
                                    try {
                                        var sentMessage = parseResponse(outbound, $scope.protocol);
                                        $scope.log(sentMessage);
                                        var nextStep = $scope.findNextStep($scope.testStep.position);
                                        if (nextStep != null && nextStep.testingType === "TA_RESPONDER") {
                                            $scope.setNextStepMessage(sentMessage);
                                        }
                                    } catch (error) {
                                        $scope.error = errors[3];
                                        $scope.logger.log("Incorrect outgoing message type");
                                    }
                                } else {
                                    $scope.logger.log("Outbound message sent is empty");
                                }
                                $scope.completeListening();
                            } else if ($scope.counter >= $scope.counterMax) {
                                $scope.warning = "We did not receive any incoming message after 2 min. <p>Possible cause (1): You are using wrong credentials. Please check the credentials in your outbound message against those created for your system.</p>  <p>Possible cause (2):The endpoint address may be incorrect.   Verify that you are using the correct endpoint address that is displayed by the tool.</p>";
                                $scope.abortListening();
                            }
                        }, function(error) {
                            $scope.error = error;
                            $scope.log("Error: " + error);
                            $scope.received = "";
                            $scope.sent = "";
                            $scope.abortListening();
                        });
                    };
                    TestExecutionClock.start(execute);
                } else {
                    $scope.logger.log("Failed to start listener");
                    $scope.logger.log("Transaction stopped");
                    $scope.connecting = false;
                    $scope.error = "Failed to start the listener. Please contact the administrator.";
                    TestExecutionClock.stop();
                }
            }, function(error) {
                $scope.connecting = false;
                $scope.counter = $scope.counterMax;
                $scope.error = "Failed to start the listener. Error: " + error;
                $scope.logger.log($scope.error);
                $scope.logger.log("Transaction stopped");
                TestExecutionClock.stop();
            });
        }
    };
    $scope.downloadJurorDoc = function(jurorDocId, title) {
        var content = $("#" + jurorDocId).html();
        if (content && content != "") {
            var form = document.createElement("form");
            form.action = "api/artifact/generateJurorDoc/pdf";
            form.method = "POST";
            form.target = "_target";
            var input = document.createElement("textarea");
            input.name = "html";
            input.value = content;
            form.appendChild(input);
            var type = document.createElement("input");
            type.name = "type";
            type.value = "JurorDocument";
            form.style.display = "none";
            form.appendChild(type);
            var nam = document.createElement("input");
            nam.name = "type";
            nam.value = title;
            form.style.display = "none";
            form.appendChild(nam);
            document.body.appendChild(form);
            form.submit();
        }
    };
    $scope.downloadTestArtifact = function(path) {
        if ($scope.testCase != null) {
            var form = document.createElement("form");
            form.action = "api/artifact/download";
            form.method = "POST";
            form.target = "_target";
            var input = document.createElement("input");
            input.name = "path";
            input.value = path;
            form.appendChild(input);
            form.style.display = "none";
            document.body.appendChild(form);
            form.submit();
        }
    };
    $scope.executeTestCase = function(testCase, tab) {
        if (testCase != null) {
            $scope.loading = true;
            TestExecutionService.init();
            CB.testStep = null;
            $scope.testStep = null;
            $scope.setTestStepExecutionTab(0);
            tab = tab && tab != null ? tab : "/cb_execution";
            $rootScope.setSubActive(tab);
            if (tab === "/cb_execution") {
                $scope.$broadcast("cb:refreshEditor");
            }
            $scope.logger.clear();
            $scope.error = null;
            $scope.warning = null;
            $scope.connecting = false;
            $scope.domain = testCase.domain;
            CB.testCase = testCase;
            $scope.transport.logs = {};
            $scope.transport.transactions = [];
            $scope.testCase = testCase;
            TestExecutionClock.stop();
            if (CB.editor != null && CB.editor.instance != null) {
                CB.editor.instance.setOption("readOnly", false);
            }
            if (testCase.type === "TestCase") {
                var testStepId = StorageService.get(StorageService.CB_LOADED_TESTSTEP_ID_KEY);
                var testStep = $scope.findTestStepById(testStepId);
                testStep = testStep != null ? testStep : $scope.testCase.children[0];
                $scope.executeTestStep(testStep);
            } else if (testCase.type === "TestStep") {
                $scope.executeTestStep(testCase);
            }
            $scope.loading = false;
        }
    };
    $scope.findTestStepById = function(testStepId) {
        if (testStepId != null && testStepId != undefined) {
            for (var i = 0; i < $scope.testCase.children.length; i++) {
                if ($scope.testCase.children[i].id === testStepId) {
                    return $scope.testCase.children[i];
                }
            }
        }
        return null;
    };
    $scope.exportAs = function(format) {
        if ($scope.testCase != null) {
            var result = TestExecutionService.getTestCaseValidationResult($scope.testCase);
            result = result != undefined ? result : null;
            var comments = TestExecutionService.getTestCaseComments($scope.testCase);
            comments = comments != undefined ? comments : null;
            ReportService.downloadTestCaseReports($scope.testCase.id, format, result, comments, $scope.testCase.nav["testPlan"], $scope.testCase.nav["testGroup"]);
        }
    };
    $scope.isReportSavingSupported = function() {
        return $rootScope.isReportSavingSupported();
    };
    $scope.isNotAllManualTest = function() {
        if ($scope.testCase != null) {
            for (var i = 0; i < $scope.testCase.children.length; i++) {
                if ($scope.testCase.children[i].testingType !== "SUT_MANUAL" && $scope.testCase.children[i].testingType !== "TA_MANUAL" && $scope.testCase.children[i].testingType !== "MANUAL") {
                    return true;
                }
            }
        }
        return false;
    };
    $scope.downloadReportAs = function(format, testStep) {
        var reportId = $scope.getTestStepValidationReport(testStep);
        if (reportId != null && reportId != undefined) {
            return ReportService.downloadTestStepValidationReport(reportId, format);
        }
    };
    $scope.savetestcasereport = function() {
        if ($scope.testCase != null) {
            $scope.saveButtonDisabled = true;
            $scope.saveButtonText = "Saving...";
            var result = TestExecutionService.getTestCaseValidationResult($scope.testCase);
            result = result != undefined ? result : null;
            var comments = TestExecutionService.getTestCaseComments($scope.testCase);
            comments = comments != undefined ? comments : null;
            var testStepReportIds = [];
            for (var i = 0; i < $scope.testCase.children.length; i++) {
                testStepReportIds.push(TestExecutionService.getTestStepValidationReport($scope.testCase.children[i]));
            }
            ReportService.saveTestCaseValidationReport($scope.testCase.id, testStepReportIds, result, comments, $scope.testCase.nav["testPlan"], $scope.testCase.nav["testGroup"]).then(function(response) {
                Notification.success({
                    message: "Report saved successfully!",
                    templateUrl: "NotificationSuccessTemplate.html",
                    scope: $rootScope,
                    delay: 5e3
                });
                $scope.saveButtonText = "Report Saved!";
            }, function(error) {
                Notification.error({
                    message: "Report could not be saved! <br>If error persists, please contact the website administrator.",
                    templateUrl: "NotificationErrorTemplate.html",
                    scope: $rootScope,
                    delay: 1e4
                });
                $scope.saveButtonDisabled = false;
                $scope.saveButtonText = "Save Test Case Report";
            });
        }
    };
    $scope.toggleTransport = function(disabled) {
        $scope.transport.disabled = disabled;
        StorageService.set(StorageService.TRANSPORT_DISABLED, disabled);
        if (CB.editor.instance != null) {
            CB.editor.instance.setOption("readOnly", !disabled);
        }
    };
    $scope.editTestStepComment = function(testStep) {
        if (!$scope.testExecutionService.testStepComments[testStep.id]) {
            $scope.testExecutionService.testStepComments[testStep.id] = "";
        }
        $scope.testExecutionService.testStepCommentsChanged[testStep.id] = true;
        $scope.testExecutionService.testStepCommentsChanges[testStep.id] = $scope.testExecutionService.testStepComments[testStep.id];
    };
    $scope.deleteTestStepComment = function(testStep) {
        $scope.testExecutionService.testStepComments[testStep.id] = null;
        $scope.testExecutionService.testStepCommentsChanges[testStep.id] = null;
        $scope.testExecutionService.testStepCommentsChanged[testStep.id] = false;
        $scope.saveTestStepComment(testStep);
    };
    $scope.resetTestStepComment = function(testStep) {
        $scope.testExecutionService.testStepCommentsChanged[testStep.id] = false;
        $scope.testExecutionService.testStepCommentsChanges[testStep.id] = null;
    };
    $scope.saveTestStepComment = function(testStep) {
        $scope.testExecutionService.testStepCommentsChanged[testStep.id] = false;
        $scope.testExecutionService.testStepComments[testStep.id] = $scope.testExecutionService.testStepCommentsChanges[testStep.id];
        $scope.updateTestStepValidationReport(testStep);
        $scope.testExecutionService.testStepCommentsChanges[testStep.id] = null;
    };
    $scope.editTestCaseComment = function(testCase) {
        if (!$scope.testExecutionService.testCaseComments[testCase.id]) {
            $scope.testExecutionService.testCaseComments[testCase.id] = "";
        }
        $scope.testExecutionService.testCaseCommentsChanged[testCase.id] = true;
        $scope.testExecutionService.testCaseCommentsChanges[testCase.id] = $scope.testExecutionService.testCaseComments[testCase.id];
    };
    $scope.deleteTestCaseComment = function(testCase) {
        $scope.testExecutionService.testCaseComments[testCase.id] = null;
        $scope.testExecutionService.testCaseCommentsChanges[testCase.id] = null;
        $scope.testExecutionService.testCaseCommentsChanged[testCase.id] = false;
        $scope.saveTestCaseComment(testCase);
    };
    $scope.resetTestCaseComment = function(testCase) {
        $scope.testExecutionService.testCaseCommentsChanged[testCase.id] = false;
        $scope.testExecutionService.testCaseCommentsChanges[testCase.id] = null;
    };
    $scope.saveTestCaseComment = function(testCase) {
        $scope.testExecutionService.testCaseCommentsChanged[testCase.id] = false;
        $scope.testExecutionService.testCaseComments[testCase.id] = $scope.testExecutionService.testCaseCommentsChanges[testCase.id];
        $scope.testExecutionService.testCaseCommentsChanges[testCase.id] = null;
    };
} ]);

angular.module("cb").controller("CBTestCaseCtrl", [ "$scope", "$window", "$filter", "$rootScope", "CB", "$timeout", "CBTestPlanListLoader", "$sce", "StorageService", "TestCaseService", "TestStepService", "TestExecutionService", "CBTestPlanLoader", "User", "userInfoService", "ReportService", function($scope, $window, $filter, $rootScope, CB, $timeout, CBTestPlanListLoader, $sce, StorageService, TestCaseService, TestStepService, TestExecutionService, CBTestPlanLoader, User, userInfoService, ReportService) {
    $scope.cb = CB;
    $scope.error = null;
    $scope.selectedTestCase = CB.selectedTestCase;
    $scope.testCase = CB.testCase;
    $scope.selectedTP = {
        id: null
    };
    $scope.preSelectedTP = {
        id: null
    };
    $scope.selectedScope = {
        key: null
    };
    $scope.testPlanScopes = [];
    $scope.allTestPlanScopes = [ {
        key: "USER",
        name: "Private"
    }, {
        key: "GLOBAL",
        name: "Public"
    } ];
    $scope.testCases = [];
    $scope.testPlans = [];
    $scope.tree = {};
    $scope.loading = true;
    $scope.loadingTP = false;
    $scope.loadingTC = false;
    $scope.loadingTPs = false;
    $scope.collapsed = false;
    var testCaseService = new TestCaseService();
    $scope.initTestCase = function() {
        $scope.error = null;
        $scope.loading = true;
        $scope.testCases = null;
        if (userInfoService.isAuthenticated()) {
            $scope.testPlanScopes = $scope.allTestPlanScopes;
            var tmp = StorageService.get(StorageService.CB_SELECTED_TESTPLAN_SCOPE_KEY);
            $scope.selectedScope.key = tmp && tmp != null ? tmp : $scope.allTestPlanScopes[1].key;
        } else {
            $scope.testPlanScopes = [ $scope.allTestPlanScopes[1] ];
            $scope.selectedScope.key = $scope.allTestPlanScopes[1].key;
        }
        $scope.selectScope();
    };
    $scope.$on("event:cb:initTestCase", function(event, args) {
        $scope.preSelectedTP.id = null;
        if (args !== undefined && args.scope !== undefined && args.group !== undefined) {
            $scope.preSelectedTP.id = StorageService.get(StorageService.CB_SELECTED_TESTPLAN_ID_KEY);
        }
        $scope.initTestCase();
    });
    $rootScope.$on("event:logoutConfirmed", function() {
        $scope.initTestCase();
    });
    $rootScope.$on("event:loginConfirmed", function() {
        $scope.initTestCase();
    });
    var findTPByPersistenceId = function(persistentId, testPlans) {
        for (var i = 0; i < testPlans.length; i++) {
            if (testPlans[i].persistentId === persistentId) {
                return testPlans[i];
            }
        }
        return null;
    };
    $scope.selectTP = function() {
        $scope.loadingTP = true;
        $scope.errorTP = null;
        $scope.selectedTestCase = null;
        if ($scope.selectedTP.id && $scope.selectedTP.id !== null && $scope.selectedTP.id !== "") {
            var tcLoader = new CBTestPlanLoader($scope.selectedTP.id, $rootScope.domain);
            tcLoader.then(function(testPlan) {
                $scope.testCases = [ testPlan ];
                testCaseService.buildTree(testPlan);
                $scope.refreshTree();
                StorageService.set(StorageService.CB_SELECTED_TESTPLAN_ID_KEY, $scope.selectedTP.id);
                $scope.selectTestCase(testPlan);
                $scope.loadingTP = false;
            }, function(error) {
                $scope.loadingTP = false;
                $scope.errorTP = "Sorry, Cannot load the test cases. Please try again";
            });
        } else {
            $scope.testCases = null;
            StorageService.set(StorageService.CB_SELECTED_TESTPLAN_ID_KEY, "");
            $scope.loadingTP = false;
        }
    };
    $scope.selectScope = function() {
        $scope.errorTP = null;
        $scope.selectedTestCase = null;
        $scope.testPlans = null;
        $scope.testCases = null;
        $scope.errorTP = null;
        $scope.loadingTP = false;
        StorageService.set(StorageService.CB_SELECTED_TESTPLAN_SCOPE_KEY, $scope.selectedScope.key);
        if ($scope.selectedScope.key && $scope.selectedScope.key !== null && $scope.selectedScope.key !== "") {
            if ($rootScope.domain != null && $rootScope.domain.domain != null) {
                $scope.loadingTP = true;
                var tcLoader = new CBTestPlanListLoader($scope.selectedScope.key, $rootScope.domain.domain);
                tcLoader.then(function(testPlans) {
                    $scope.error = null;
                    $scope.testPlans = $filter("orderBy")(testPlans, "position");
                    var targetId = null;
                    if ($scope.testPlans.length > 0) {
                        if ($scope.testPlans.length === 1) {
                            targetId = $scope.testPlans[0].id;
                        } else if ($scope.preSelectedTP.id !== null) {
                            targetId = $scope.preSelectedTP.id;
                        } else if (StorageService.get(StorageService.CB_SELECTED_TESTPLAN_ID_KEY) !== null) {
                            var previousTpId = StorageService.get(StorageService.CB_SELECTED_TESTPLAN_ID_KEY);
                            targetId = previousTpId == undefined || previousTpId == null ? $scope.testPlans[0].id : previousTpId;
                        } else if (userInfoService.isAuthenticated()) {
                            var lastTestPlanPersistenceId = userInfoService.getLastTestPlanPersistenceId();
                            var tp = findTPByPersistenceId(lastTestPlanPersistenceId, $scope.testPlans);
                            if (tp != null) {
                                targetId = tp.id;
                            } else {
                                targetId = $scope.testPlans[0].id;
                            }
                        } else {
                            targetId = $scope.testPlans[0].id;
                        }
                        $scope.selectedTP.id = targetId.toString();
                        $scope.selectTP();
                    } else {
                        $scope.loadingTP = false;
                    }
                    $scope.loading = false;
                }, function(error) {
                    $scope.loadingTP = false;
                    $scope.loading = false;
                    $scope.error = "Sorry, Cannot load the test plans. Please try again";
                });
            }
        } else {
            StorageService.set(StorageService.CB_SELECTED_TESTPLAN_ID_KEY, "");
        }
    };
    $scope.refreshTree = function() {
        $timeout(function() {
            if ($scope.testCases != null) {
                if (typeof $scope.tree.build_all == "function") {
                    $scope.tree.build_all($scope.testCases);
                    var b = $scope.tree.get_first_branch();
                    if (b != null && b) {
                        $scope.tree.expand_branch(b);
                    }
                    var testCase = null;
                    var id = StorageService.get(StorageService.CB_SELECTED_TESTCASE_ID_KEY);
                    var type = StorageService.get(StorageService.CB_SELECTED_TESTCASE_TYPE_KEY);
                    if (id != null && type != null) {
                        for (var i = 0; i < $scope.testCases.length; i++) {
                            var found = testCaseService.findOneByIdAndType(id, type, $scope.testCases[i]);
                            if (found != null) {
                                testCase = found;
                                break;
                            }
                        }
                        if (testCase != null) {
                            $scope.selectNode(id, type);
                        }
                    }
                    testCase = null;
                    id = StorageService.get(StorageService.CB_LOADED_TESTCASE_ID_KEY);
                    type = StorageService.get(StorageService.CB_LOADED_TESTCASE_TYPE_KEY);
                    if (id != null && type != null) {
                        for (var i = 0; i < $scope.testCases.length; i++) {
                            var found = testCaseService.findOneByIdAndType(id, type, $scope.testCases[i]);
                            if (found != null) {
                                testCase = found;
                                break;
                            }
                        }
                        if (testCase != null) {
                            var tab = StorageService.get(StorageService.ACTIVE_SUB_TAB_KEY);
                            $scope.loadTestCase(testCase, tab, false);
                        }
                    }
                } else {
                    $scope.error = "Something went wrong. Please refresh your page again.";
                }
            }
            $scope.loading = false;
        }, 1e3);
    };
    $scope.refreshLoadedTestCase = function() {
        var testCase = null;
        var id = StorageService.get(StorageService.CB_LOADED_TESTCASE_ID_KEY);
        var type = StorageService.get(StorageService.CB_LOADED_TESTCASE_TYPE_KEY);
        if (id != null && type != null) {
            for (var i = 0; i < $scope.testCases.length; i++) {
                var found = testCaseService.findOneByIdAndType(id, type, $scope.testCases[i]);
                if (found != null) {
                    testCase = found;
                    break;
                }
            }
            if (testCase != null) {
                var tab = StorageService.get(StorageService.ACTIVE_SUB_TAB_KEY);
                $scope.loadTestCase(testCase, tab, false);
            }
        }
    };
    $scope.isSelectable = function(node) {
        return true;
    };
    $scope.selectTestCase = function(node) {
        $scope.loadingTC = true;
        $scope.selectedTestCase = node;
        $scope.cb.selectedTestCase = node;
        StorageService.set(StorageService.CB_SELECTED_TESTCASE_ID_KEY, node.id);
        StorageService.set(StorageService.CB_SELECTED_TESTCASE_TYPE_KEY, node.type);
        $timeout(function() {
            $scope.$broadcast("cb:testCaseSelected", $scope.selectedTestCase);
            $scope.loadingTC = false;
        });
    };
    $scope.selectNode = function(id, type) {
        $timeout(function() {
            testCaseService.selectNodeByIdAndType($scope.tree, id, type);
        }, 0);
    };
    $scope.loadTestCase = function(testCase, tab, clear) {
        if (clear === undefined || clear === true) {
            StorageService.remove(StorageService.CB_EDITOR_CONTENT_KEY);
            var id = StorageService.get(StorageService.CB_LOADED_TESTCASE_ID_KEY);
            var type = StorageService.get(StorageService.CB_LOADED_TESTCASE_TYPE_KEY);
            if (id != null && id != undefined) {
                if (type === "TestCase") {
                    TestExecutionService.clearTestCase(id);
                } else if (type === "TestStep") {
                    TestExecutionService.clearTestStep(id);
                }
                StorageService.remove(StorageService.CB_LOADED_TESTCASE_ID_KEY);
                StorageService.remove(StorageService.CB_LOADED_TESTCASE_TYPE_KEY);
            }
            id = StorageService.get(StorageService.CB_LOADED_TESTSTEP_ID_KEY);
            type = StorageService.get(StorageService.CB_LOADED_TESTSTEP_TYPE_KEY);
            if (id != null && id != undefined) {
                TestExecutionService.clearTestStep(id);
                StorageService.remove(StorageService.CB_LOADED_TESTCASE_ID_KEY);
                StorageService.remove(StorageService.CB_LOADED_TESTCASE_TYPE_KEY);
            }
        }
        StorageService.set(StorageService.CB_LOADED_TESTCASE_ID_KEY, testCase.id);
        StorageService.set(StorageService.CB_LOADED_TESTCASE_TYPE_KEY, testCase.type);
        if (testCase.type === "TestStep") {
            $rootScope.$emit("cb:updateSavedReports", testCase);
        }
        $timeout(function() {
            $rootScope.$broadcast("cb:testCaseLoaded", testCase, tab);
        });
        if (CB.editor != null && CB.editor.instance != null) {
            CB.editor.instance.setOption("readOnly", false);
        }
    };
    $scope.expandAll = function() {
        if ($scope.tree != null) $scope.tree.expand_all();
    };
    $scope.collapseAll = function() {
        if ($scope.tree != null) $scope.tree.collapse_all();
    };
    $rootScope.$on("event:logoutConfirmed", function() {
        $scope.initTestCase();
    });
    $rootScope.$on("event:loginConfirmed", function() {
        $scope.initTestCase();
    });
    $rootScope.$on("event:refreshLoadedTestCase", function() {
        $scope.refreshLoadedTestCase();
    });
    $rootScope.$on("cb:updateSavedReports", function(event, testStep) {
        if (userInfoService.isAuthenticated() && $rootScope.isReportSavingSupported()) {
            $timeout(function() {
                ReportService.getAllIndependantTSByAccountIdAndDomainAndtestStepId($rootScope.domain.domain, testStep.persistentId).then(function(reports) {
                    if (reports !== null) {
                        $scope.cb.selectedSavedReport = null;
                        $scope.cb.savedReports = reports;
                    } else {
                        $scope.cb.savedReports = [];
                        $scope.cb.selectedSavedReport = null;
                    }
                }, function(error) {
                    $scope.cb.selectedSavedReport = null;
                    $scope.cb.savedReports = [];
                    $scope.loadingAll = false;
                    $scope.error = "Sorry, Cannot load the reports. Please try again. \n DEBUG:" + error;
                });
            }, 100);
        }
    });
} ]);

angular.module("cb").controller("CBSavedReportCtrl", [ "$scope", "$sce", "$http", "CB", "ReportService", "$modal", function($scope, $sce, $http, CB, ReportService, $modal) {
    $scope.cb = CB;
    $scope.selectReport = function(report) {
        $scope.loading = true;
        ReportService.getUserTCReportHTML(report.id).then(function(report) {
            if (report !== null) {
                $scope.cb.selectedSavedReport = report;
            }
        }, function(error) {
            $scope.error = "Sorry, Cannot load the report data. Please try again. \n DEBUG:" + error;
        }).finally(function() {
            $scope.loading = false;
        });
    };
    $scope.downloadAs = function(format) {
        if ($scope.cb.selectedSavedReport) {
            return ReportService.downloadUserTestStepValidationReport($scope.cb.selectedSavedReport.id, format);
        }
    };
    $scope.deleteReport = function(report) {
        var modalInstance = $modal.open({
            templateUrl: "confirmReportDelete.html",
            controller: "ConfirmDialogCtrl",
            size: "md",
            backdrop: true,
            keyboard: true
        });
        modalInstance.result.then(function(resultDiag) {
            if (resultDiag) {
                ReportService.deleteTSReport(report.id).then(function(result) {
                    var index = $scope.reports.indexOf(report);
                    if (index > -1) {
                        $scope.reports.splice(index, 1);
                    }
                    Notification.success({
                        message: "Report deleted successfully!",
                        templateUrl: "NotificationSuccessTemplate.html",
                        scope: $rootScope,
                        delay: 5e3
                    });
                }, function(error) {
                    Notification.error({
                        message: "Report deletion failed! <br>If error persists, please contact the website administrator.",
                        templateUrl: "NotificationErrorTemplate.html",
                        scope: $rootScope,
                        delay: 1e4
                    });
                });
            }
        }, function(resultDiag) {});
    };
} ]);

angular.module("cb").controller("CBValidatorCtrl", [ "$scope", "$http", "CB", "$window", "$timeout", "$modal", "NewValidationResult", "$rootScope", "ServiceDelegator", "StorageService", "TestExecutionService", "MessageUtil", "FileUpload", function($scope, $http, CB, $window, $timeout, $modal, NewValidationResult, $rootScope, ServiceDelegator, StorageService, TestExecutionService, MessageUtil, FileUpload) {
    $scope.cb = CB;
    $scope.testStep = null;
    $scope.message = CB.message;
    $scope.loading = true;
    $scope.error = null;
    $scope.vError = null;
    $scope.vLoading = true;
    $scope.mError = null;
    $scope.mLoading = true;
    $scope.counter = 0;
    $scope.type = "cb";
    $scope.loadRate = 4e3;
    $scope.tokenPromise = null;
    $scope.editorInit = false;
    $scope.nodelay = false;
    $scope.resized = false;
    $scope.selectedItem = null;
    $scope.activeTab = 0;
    $scope.tError = null;
    $scope.tLoading = false;
    $scope.dqaCodes = StorageService.get(StorageService.DQA_OPTIONS_KEY) != null ? angular.fromJson(StorageService.get(StorageService.DQA_OPTIONS_KEY)) : [];
    $scope.domain = null;
    $scope.protocol = null;
    $scope.hasNonPrintable = false;
    $scope.showDQAOptions = function() {
        var modalInstance = $modal.open({
            templateUrl: "DQAConfig.html",
            controller: "DQAConfigCtrl",
            windowClass: "dq-modal",
            animation: true,
            keyboard: false,
            backdrop: false
        });
        modalInstance.result.then(function(selectedCodes) {
            $scope.dqaCodes = selectedCodes;
        }, function() {});
    };
    $scope.isTestCase = function() {
        return CB.testCase != null && CB.testCase.type === "TestCase";
    };
    $scope.refreshEditor = function() {
        $timeout(function() {
            if ($scope.editor) $scope.editor.refresh();
        }, 1e3);
    };
    $scope.loadExampleMessage = function() {
        if ($scope.testStep != null) {
            var testContext = $scope.testStep.testContext;
            if (testContext) {
                var message = testContext.message && testContext.message != null ? testContext.message.content : "";
                if ($scope.isTestCase()) {
                    TestExecutionService.setTestStepExecutionMessage($scope.testStep, message);
                }
                $scope.nodelay = true;
                $scope.cb.editor.instance.doc.setValue(message);
                $scope.execute();
            }
        }
    };
    $scope.uploadMessage = function(file, errFiles) {
        $scope.f = file;
        FileUpload.uploadMessage(file, errFiles).then(function(response) {
            $timeout(function() {
                file.result = response.data;
                var result = response.data;
                var fileName = file.name;
                $scope.nodelay = true;
                var tmp = angular.fromJson(result);
                $scope.cb.message.name = fileName;
                $scope.cb.editor.instance.doc.setValue(tmp.content);
                $scope.mError = null;
                $scope.execute();
                Notification.success({
                    message: "File " + fileName + " successfully uploaded!",
                    templateUrl: "NotificationSuccessTemplate.html",
                    scope: $rootScope,
                    delay: 3e4
                });
            });
        }, function(response) {
            $scope.mError = response.data;
        });
    };
    $scope.setLoadRate = function(value) {
        $scope.loadRate = value;
    };
    $scope.initCodemirror = function() {
        $scope.editor = CodeMirror.fromTextArea(document.getElementById("cb-textarea"), {
            lineNumbers: true,
            fixedGutter: true,
            theme: "elegant",
            readOnly: false,
            showCursorWhenSelecting: true
        });
        $scope.editor.setSize("100%", 345);
        $scope.editor.on("keyup", function() {
            $timeout(function() {
                var msg = $scope.editor.doc.getValue();
                $scope.error = null;
                if ($scope.tokenPromise) {
                    $timeout.cancel($scope.tokenPromise);
                    $scope.tokenPromise = undefined;
                }
                if (msg.trim() !== "") {
                    $scope.tokenPromise = $timeout(function() {
                        $scope.execute();
                    }, $scope.loadRate);
                } else {
                    $scope.execute();
                }
            });
        });
        $scope.editor.on("dblclick", function(editor) {
            $timeout(function() {
                var coordinate = ServiceDelegator.getCursorService($scope.testStep.testContext.format).getCoordinate($scope.editor, $scope.cb.tree);
                if (coordinate && coordinate != null) {
                    coordinate.start.index = coordinate.start.index + 1;
                    coordinate.end.index = coordinate.end.index + 1;
                    $scope.cb.cursor.init(coordinate, true);
                    ServiceDelegator.getTreeService($scope.testStep.testContext.format).selectNodeByIndex($scope.cb.tree.root, CB.cursor, CB.message.content);
                }
            });
        });
    };
    $scope.validateMessage = function() {
        try {
            if ($scope.testStep != null) {
                if ($scope.cb.message.content !== "" && $scope.testStep.testContext != null) {
                    $scope.vLoading = true;
                    $scope.vError = null;
                    TestExecutionService.deleteTestStepValidationReport($scope.testStep);
                    var validator = ServiceDelegator.getMessageValidator($scope.testStep.testContext.format).validate($scope.testStep.testContext.id, $scope.cb.message.content, $scope.testStep.nav, "Based", [], "1223");
                    validator.then(function(mvResult) {
                        $scope.vLoading = false;
                        $scope.setTestStepValidationReport(mvResult);
                    }, function(error) {
                        $scope.vLoading = false;
                        $scope.vError = error;
                        $scope.setTestStepValidationReport(null);
                    });
                } else {
                    var reportId = TestExecutionService.getTestStepValidationReport($scope.testStep);
                    $scope.setTestStepValidationReport({
                        reportId: reportId
                    });
                    $scope.vLoading = false;
                    $scope.vError = null;
                }
            }
        } catch (error) {
            $scope.vLoading = false;
            $scope.vError = null;
            $scope.setTestStepValidationReport(null);
        }
    };
    $scope.setTestStepValidationReport = function(mvResult) {
        if ($scope.testStep != null) {
            if (mvResult != null && mvResult != undefined && mvResult.reportId != null) {
                $scope.completeStep($scope.testStep);
                TestExecutionService.setTestStepValidationReport($scope.testStep, mvResult.reportId);
            }
            $rootScope.$emit("cb:validationResultLoaded", mvResult, $scope.testStep, $scope.getTestType());
        }
    };
    $scope.setTestStepMessageTree = function(messageObject) {
        $scope.buildMessageTree(messageObject);
        var tree = messageObject && messageObject != null && messageObject.elements ? messageObject : undefined;
        TestExecutionService.setTestStepMessageTree($scope.testStep, tree);
    };
    $scope.buildMessageTree = function(messageObject) {
        if ($scope.testStep != null) {
            var elements = messageObject && messageObject != null && messageObject.elements ? messageObject.elements : [];
            if (typeof $scope.cb.tree.root.build_all == "function") {
                $scope.cb.tree.root.build_all(elements);
            }
            var delimeters = messageObject && messageObject != null && messageObject.delimeters ? messageObject.delimeters : [];
            ServiceDelegator.updateEditorMode($scope.editor, delimeters, $scope.testStep.testContext.format);
            ServiceDelegator.getEditorService($scope.testStep.testContext.format).setEditor($scope.editor);
            ServiceDelegator.getTreeService($scope.testStep.testContext.format).setEditor($scope.editor);
        }
    };
    $scope.clearMessage = function() {
        $scope.nodelay = true;
        $scope.mError = null;
        if ($scope.testStep != null) {
            TestExecutionService.deleteTestStepValidationReport($scope.testStep);
            TestExecutionService.deleteTestStepMessageTree($scope.testStep);
        }
        if ($scope.editor) {
            $scope.editor.doc.setValue("");
            $scope.execute();
        }
    };
    $scope.saveMessage = function() {
        $scope.cb.message.download();
    };
    $scope.parseMessage = function() {
        try {
            if ($scope.testStep != null) {
                if ($scope.cb.message.content != "" && $scope.testStep.testContext != null) {
                    $scope.tLoading = true;
                    TestExecutionService.deleteTestStepMessageTree($scope.testStep);
                    var parsed = ServiceDelegator.getMessageParser($scope.testStep.testContext.format).parse($scope.testStep.testContext.id, $scope.cb.message.content);
                    parsed.then(function(value) {
                        $scope.tLoading = false;
                        $scope.setTestStepMessageTree(value);
                    }, function(error) {
                        $scope.tLoading = false;
                        $scope.tError = error;
                        $scope.setTestStepMessageTree([]);
                    });
                } else {
                    $scope.setTestStepMessageTree([]);
                    $scope.tError = null;
                    $scope.tLoading = false;
                }
            }
        } catch (error) {
            $scope.tLoading = false;
            $scope.tError = error;
        }
    };
    $scope.onNodeSelect = function(node) {
        ServiceDelegator.getTreeService($scope.testStep.testContext.format).getEndIndex(node, $scope.cb.message.content);
        $scope.cb.cursor.init(node.data, false);
        ServiceDelegator.getEditorService($scope.testStep.testContext.format).select($scope.editor, $scope.cb.cursor);
    };
    $scope.execute = function() {
        if ($scope.tokenPromise) {
            $timeout.cancel($scope.tokenPromise);
            $scope.tokenPromise = undefined;
        }
        $scope.error = null;
        $scope.tError = null;
        $scope.mError = null;
        $scope.vError = null;
        $scope.cb.message.content = $scope.editor.doc.getValue();
        $scope.setHasNonPrintableCharacters();
        StorageService.set(StorageService.CB_EDITOR_CONTENT_KEY, $scope.cb.message.content);
        $scope.refreshEditor();
        if (!$scope.isTestCase() || !$scope.isTestCaseCompleted()) {
            TestExecutionService.setTestStepExecutionMessage($scope.testStep, $scope.cb.message.content);
            $scope.validateMessage();
            $scope.parseMessage();
        } else {
            var reportId = TestExecutionService.getTestStepValidationReport($scope.testStep);
            $scope.setTestStepValidationReport({
                reportId: reportId
            });
            $scope.setTestStepMessageTree(TestExecutionService.getTestStepMessageTree($scope.testStep));
        }
    };
    $scope.executeWithMessage = function(content) {
        if ($scope.editor) {
            $scope.editor.doc.setValue(content);
            $scope.execute();
        }
    };
    $scope.clear = function() {
        $scope.vLoading = false;
        $scope.tLoading = false;
        $scope.mLoading = false;
        $scope.error = null;
        $scope.tError = null;
        $scope.mError = null;
        $scope.vError = null;
        $scope.setTestStepValidationReport(null);
    };
    $scope.removeDuplicates = function() {
        $scope.vLoading = true;
        $scope.$broadcast("cb:removeDuplicates");
    };
    $scope.clear();
    $scope.initCodemirror();
    $scope.$on("cb:refreshEditor", function(event) {
        $scope.refreshEditor();
    });
    $scope.$on("cb:clearEditor", function(event) {
        $scope.clearMessage();
    });
    $rootScope.$on("cb:reportLoaded", function(event, report) {
        if ($scope.testStep != null) {
            TestExecutionService.setTestStepValidationReport($scope.testStep, report);
        }
    });
    $scope.$on("cb:testStepLoaded", function(event, testStep) {
        $scope.clear();
        $scope.testStep = testStep;
        if ($scope.testStep.testContext != null) {
            $scope.cb.editor = ServiceDelegator.getEditor($scope.testStep.testContext.format);
            $scope.cb.editor.instance = $scope.editor;
            $scope.cb.cursor = ServiceDelegator.getCursor($scope.testStep.testContext.format);
            var content = null;
            if (!$scope.isTestCase()) {
                $scope.nodelay = false;
                content = StorageService.get(StorageService.CB_EDITOR_CONTENT_KEY) == null ? "" : StorageService.get(StorageService.CB_EDITOR_CONTENT_KEY);
            } else {
                $scope.nodelay = true;
                content = TestExecutionService.getTestStepExecutionMessage($scope.testStep);
                if (content == undefined) content = "";
            }
            $scope.executeWithMessage(content);
        }
    });
    $scope.$on("cb:removeTestStep", function(event, testStep) {
        $scope.testStep = null;
    });
    $scope.$on("cb:loadEditorContent", function(event, message) {
        $scope.nodelay = true;
        var content = message == null ? "" : message;
        $scope.editor.doc.setValue(content);
        $scope.cb.message.id = null;
        $scope.cb.message.name = "";
        $scope.execute();
    });
    $rootScope.$on("cb:duplicatesRemoved", function(event, report) {
        $scope.vLoading = false;
    });
    $scope.initValidation = function() {};
    $scope.expandAll = function() {
        if ($scope.cb.tree.root != null) $scope.cb.tree.root.expand_all();
    };
    $scope.collapseAll = function() {
        if ($scope.cb.tree.root != null) $scope.cb.tree.root.collapse_all();
    };
    $scope.setHasNonPrintableCharacters = function() {
        $scope.hasNonPrintable = MessageUtil.hasNonPrintable($scope.cb.message.content);
    };
    $scope.showMessageWithHexadecimal = function() {
        var modalInstance = $modal.open({
            templateUrl: "MessageWithHexadecimal.html",
            controller: "MessageWithHexadecimalDlgCtrl",
            windowClass: "valueset-modal",
            animation: false,
            keyboard: true,
            backdrop: true,
            resolve: {
                original: function() {
                    return $scope.cb.message.content;
                }
            }
        });
    };
} ]);

angular.module("cb").controller("CBProfileViewerCtrl", [ "$scope", "CB", function($scope, CB) {
    $scope.cb = CB;
} ]);

angular.module("cb").controller("CBReportCtrl", [ "$scope", "$sce", "$http", "CB", function($scope, $sce, $http, CB) {
    $scope.cb = CB;
} ]);

angular.module("cb").controller("CBVocabularyCtrl", [ "$scope", "CB", function($scope, CB) {
    $scope.cb = CB;
} ]);

angular.module("cb").controller("PastTestStepConsoleCtrl", function($scope, $modalInstance, title, log) {
    $scope.title = title;
    $scope.log = log;
    $scope.cancel = function() {
        $modalInstance.dismiss("cancel");
    };
    $scope.close = function() {
        $modalInstance.close();
    };
});

angular.module("cb").controller("CurrentTestStepConsoleCtrl", function($scope, $modalInstance, title, logger) {
    $scope.title = title;
    $scope.logger = logger;
    $scope.cancel = function() {
        $modalInstance.dismiss("cancel");
    };
    $scope.close = function() {
        $modalInstance.close();
    };
});

angular.module("cb").controller("CBManualValidationCtrl", [ "$scope", "CB", "$http", "TestExecutionService", "$timeout", "ManualReportService", "$rootScope", function($scope, CB, $http, TestExecutionService, $timeout, ManualReportService, $rootScope) {
    $scope.cb = CB;
    $scope.saving = false;
    $scope.error = null;
    $scope.testStep = null;
    $scope.report = null;
    $scope.testExecutionService = TestExecutionService;
    $scope.saved = false;
    $scope.error = null;
    $scope.$on("cb:manualTestStepLoaded", function(event, testStep) {
        $scope.saved = false;
        $scope.saving = false;
        $scope.error = null;
        $scope.testStep = testStep;
        $scope.report = TestExecutionService.getTestStepValidationReport(testStep) === undefined || TestExecutionService.getTestStepValidationReport(testStep) === null ? {
            result: {
                value: "",
                comments: ""
            },
            html: null
        } : TestExecutionService.getTestStepValidationReport(testStep);
    });
} ]);

angular.module("cb").controller("CBManualReportCtrl", [ "$scope", "$sce", "$http", "CB", function($scope, $sce, $http, CB) {
    $scope.cb = CB;
} ]);

angular.module("cb").controller("CBTestManagementCtrl", function($scope, $window, $filter, $rootScope, CB, $timeout, $sce, StorageService, TestCaseService, TestStepService, CBTestPlanManager, User, userInfoService, $modal, Notification, $modalStack, $location, $routeParams) {
    $scope.selectedTestCase = CB.selectedTestCase;
    $scope.testCase = CB.testCase;
    $scope.selectedTP = {
        id: null
    };
    $scope.selectedScope = {
        key: null
    };
    $scope.testPlanScopes = null;
    $scope.testCases = [];
    $scope.testPlans = [];
    $scope.tree = {};
    $scope.loading = true;
    $scope.loadingTP = false;
    $scope.loadingTC = false;
    $scope.loadingTPs = false;
    $scope.allTestPlanScopes = [ {
        key: "USER",
        name: "Private"
    }, {
        key: "GLOBAL",
        name: "Public"
    } ];
    $scope.token = $routeParams.x;
    $scope.domain = $routeParams.d;
    $scope.error = null;
    $scope.collapsed = false;
    var testCaseService = new TestCaseService();
    $scope.$on("event:cb:initManagement", function() {
        $scope.initTestCase();
    });
    $scope.initTestCase = function() {
        if ($rootScope.isCbManagementSupported() && userInfoService.isAuthenticated() && $rootScope.hasWriteAccess()) {
            $scope.error = null;
            $scope.loading = true;
            $scope.testPlans = null;
            if (userInfoService.isAdmin() || userInfoService.isSupervisor()) {
                $scope.testPlanScopes = $scope.allTestPlanScopes;
                var tmp = StorageService.get(StorageService.CB_MANAGE_SELECTED_TESTPLAN_SCOPE_KEY);
                $scope.selectedScope.key = tmp && tmp != null ? tmp : $scope.testPlanScopes[1].key;
            } else {
                $scope.testPlanScopes = [ $scope.allTestPlanScopes[0] ];
                $scope.selectedScope.key = $scope.testPlanScopes[0].key;
            }
            $scope.selectScope();
        }
    };
    var findTPByPersistenceId = function(persistentId, testPlans) {
        for (var i = 0; i < testPlans.length; i++) {
            if (testPlans[i].persistentId === persistentId) {
                return testPlans[i];
            }
        }
        return null;
    };
    $scope.get_icon_type = function(node) {
        if (node.type === "TestObject" || node.type === "TestStep") {
            var connType = node["testingType"];
            return connType === "TA_MANUAL" || connType === "SUT_MANUAL" ? "fa fa-wrench" : connType === "SUT_RESPONDER" || connType === "SUT_INITIATOR" ? "fa fa-arrow-right" : connType === "TA_RESPONDER" || connType === "TA_INITIATOR" ? "fa fa-arrow-left" : "fa fa-check-square-o";
        } else {
            return "";
        }
    };
    $scope.selectTP = function() {
        $scope.loadingTP = true;
        $scope.errorTP = null;
        $scope.selectedTestCase = null;
        if ($scope.selectedTP.id && $scope.selectedTP.id !== null && $scope.selectedTP.id !== "") {
            CBTestPlanManager.getTestPlan($scope.selectedTP.id).then(function(testPlan) {
                $scope.testCases = [ testPlan ];
                testCaseService.buildTree(testPlan);
                StorageService.set(StorageService.CB_MANAGE_SELECTED_TESTPLAN_ID_KEY, $scope.selectedTP.id);
                $scope.selectTestNode(testPlan);
                $scope.loadingTP = false;
            }, function(error) {
                $scope.loadingTP = false;
                $scope.errorTP = "Sorry, Cannot load the test cases. Please try again";
            });
        } else {
            $scope.testCases = null;
            StorageService.set(StorageService.CB_MANAGE_SELECTED_TESTPLAN_ID_KEY, "");
            $scope.loadingTP = false;
        }
    };
    $scope.selectScope = function() {
        $scope.errorTP = null;
        $scope.selectedTestCase = null;
        $scope.testPlans = null;
        $scope.testCases = null;
        $scope.errorTP = null;
        $scope.loadingTP = false;
        StorageService.set(StorageService.CB_MANAGE_SELECTED_TESTPLAN_SCOPE_KEY, $scope.selectedScope.key);
        if ($scope.selectedScope.key && $scope.selectedScope.key !== null && $scope.selectedScope.key !== "" && $rootScope.domain != null) {
            if ($rootScope.domain && $rootScope.domain.domain != null) {
                $scope.loadingTP = true;
                CBTestPlanManager.getTestPlans($scope.selectedScope.key, $rootScope.domain.domain).then(function(testPlans) {
                    $scope.error = null;
                    $scope.testPlans = $filter("orderBy")(testPlans, "position");
                    var targetId = null;
                    if ($scope.testPlans.length > 0) {
                        if ($scope.testPlans.length === 1) {
                            targetId = $scope.testPlans[0].id;
                        }
                        if (targetId == null) {
                            var previousTpId = StorageService.get(StorageService.CB_MANAGE_SELECTED_TESTPLAN_ID_KEY);
                            targetId = previousTpId == undefined || previousTpId == null ? "" : previousTpId;
                        }
                        $scope.selectedTP.id = targetId.toString();
                        $scope.selectTP();
                    } else {
                        $scope.loadingTP = false;
                    }
                    $scope.loading = false;
                }, function(error) {
                    $scope.loadingTP = false;
                    $scope.loading = false;
                    $scope.error = "Sorry, Cannot load the test plans. Please try again";
                });
            }
        } else {
            StorageService.set(StorageService.CB_MANAGE_SELECTED_TESTPLAN_ID_KEY, "");
        }
    };
    $scope.refreshTree = function() {
        $timeout(function() {
            if ($scope.testCases != null) {
                if (typeof $scope.tree.build_all == "function") {
                    $scope.tree.build_all($scope.testCases);
                    var b = $scope.tree.get_first_branch();
                    if (b != null && b) {
                        $scope.tree.expand_branch(b);
                    }
                    var testCase = null;
                    var id = StorageService.get(StorageService.CB_MANAGE_SELECTED_TESTCASE_ID_KEY);
                    var type = StorageService.get(StorageService.CB_MANAGE_SELECTED_TESTCASE_TYPE_KEY);
                    if (id != null && type != null) {
                        for (var i = 0; i < $scope.testCases.length; i++) {
                            var found = testCaseService.findOneByIdAndType(id, type, $scope.testCases[i]);
                            if (found != null) {
                                testCase = found;
                                break;
                            }
                        }
                        if (testCase != null) {
                            $scope.selectNode(id, type);
                        }
                    }
                    testCase = null;
                    id = StorageService.get(StorageService.CB_MANAGE_LOADED_TESTCASE_ID_KEY);
                    type = StorageService.get(StorageService.CB_MANAGE_LOADED_TESTCASE_TYPE_KEY);
                    if (id != null && type != null) {
                        for (var i = 0; i < $scope.testCases.length; i++) {
                            var found = testCaseService.findOneByIdAndType(id, type, $scope.testCases[i]);
                            if (found != null) {
                                testCase = found;
                                break;
                            }
                        }
                        if (testCase != null) {
                            var tab = StorageService.get(StorageService.ACTIVE_SUB_TAB_KEY);
                            $scope.loadTestCase(testCase, tab, false);
                        }
                    }
                } else {
                    $scope.error = "Something went wrong. Please refresh your page again.";
                }
            }
            $scope.loading = false;
        }, 1e3);
    };
    $scope.isSelectable = function(node) {
        return true;
    };
    $scope.selectTestNode = function(node) {
        $scope.loadingTC = true;
        $scope.error = null;
        $scope.selectedTestCase = node;
        StorageService.set(StorageService.CB_MANAGE_SELECTED_TESTCASE_ID_KEY, node.id);
        StorageService.set(StorageService.CB_MANAGE_SELECTED_TESTCASE_TYPE_KEY, node.type);
        $timeout(function() {
            $scope.$broadcast("cb-manage:testCaseSelected", $scope.selectedTestCase);
            $scope.loadingTC = false;
        });
    };
    $scope.selectNode = function(id, type) {
        $timeout(function() {
            testCaseService.selectNodeByIdAndType($scope.tree, id, type);
        }, 0);
    };
    $scope.deleteTreeNode = function(node, potentialParent) {
        if (potentialParent.children && potentialParent.children.length > 0) {
            for (var i = 0; i < potentialParent.children.length; i++) {
                var child = potentialParent.children[i];
                if (child == node) {
                    potentialParent.children.splice(i, 1);
                    return true;
                } else {
                    var done = $scope.deleteTreeNode(node, child);
                    if (done) {
                        return true;
                    }
                }
            }
        }
        return false;
    };
    $scope.afterDelete = function(node) {
        for (var i = 0; i < $scope.testCases.length; i++) {
            if ($scope.deleteTreeNode(node, $scope.testCases[i]) == true) {
                if (node === $scope.selectedTestCase) {
                    $scope.selectedTestCase = null;
                }
                break;
            }
        }
    };
    $scope.deleteTestStep = function(testStep) {
        $scope.error = null;
        var modalInstance = $modal.open({
            templateUrl: "views/cb/manage/confirm-delete-teststep.html",
            controller: "ConfirmDialogCtrl",
            size: "md",
            backdrop: "static",
            keyboard: false
        });
        modalInstance.result.then(function(result) {
            if (result) {
                CBTestPlanManager.deleteTestStep(testStep).then(function(result) {
                    if (result.status === "SUCCESS") {
                        $scope.afterDelete(testStep);
                        Notification.success({
                            message: "Test Step deleted successfully !",
                            templateUrl: "NotificationSuccessTemplate.html",
                            scope: $rootScope,
                            delay: 5e3
                        });
                    } else {
                        $scope.error = result.message;
                    }
                }, function(error) {
                    $scope.error = "Sorry, Cannot delete the test step. Please try again. \n DEBUG:" + error;
                });
            }
        }, function(result) {});
    };
    $scope.deleteTestCase = function(testCase) {
        $scope.error = null;
        var modalInstance = $modal.open({
            templateUrl: "views/cb/manage/confirm-delete-testcase.html",
            controller: "ConfirmDialogCtrl",
            size: "md",
            backdrop: "static",
            keyboard: false
        });
        modalInstance.result.then(function(result) {
            if (result) {
                CBTestPlanManager.deleteTestCase(testCase).then(function(result) {
                    if (result.status === "SUCCESS") {
                        $scope.afterDelete(testCase);
                        Notification.success({
                            message: "Test Case deleted successfully !",
                            templateUrl: "NotificationSuccessTemplate.html",
                            scope: $rootScope,
                            delay: 5e3
                        });
                    } else {
                        $scope.error = result.message;
                    }
                }, function(error) {
                    $scope.error = "Sorry, Cannot delete the test case. Please try again. \n DEBUG:" + error;
                });
            }
        }, function(result) {});
    };
    $scope.deleteTestCaseGroup = function(testCaseGroup) {
        $scope.error = null;
        var modalInstance = $modal.open({
            templateUrl: "views/cb/manage/confirm-delete-testgroup.html",
            controller: "ConfirmDialogCtrl",
            size: "md",
            backdrop: "static",
            keyboard: false
        });
        modalInstance.result.then(function(result) {
            if (result) {
                CBTestPlanManager.deleteTestCaseGroup(testCaseGroup).then(function(result) {
                    if (result.status === "SUCCESS") {
                        $scope.afterDelete(testCaseGroup);
                        Notification.success({
                            message: "Test Case Group deleted successfully !",
                            templateUrl: "NotificationSuccessTemplate.html",
                            scope: $rootScope,
                            delay: 5e3
                        });
                    } else {
                        $scope.error = result.message;
                    }
                }, function(error) {
                    $scope.error = "Sorry, Cannot delete the test case group. Please try again. \n DEBUG:" + error;
                });
            }
        }, function(result) {});
    };
    $scope.deleteTestPlan = function(testPlan) {
        $scope.error = null;
        var modalInstance = $modal.open({
            templateUrl: "views/cb/manage/confirm-delete-testplan.html",
            controller: "ConfirmDialogCtrl",
            size: "md",
            backdrop: "static",
            keyboard: false
        });
        modalInstance.result.then(function(result) {
            if (result) {
                CBTestPlanManager.deleteTestPlan(testPlan).then(function(result) {
                    if (result.status === "SUCCESS") {
                        if ($scope.testPlans != null) {
                            var ind = -1;
                            for (var i = 0; i < $scope.testPlans.length; i++) {
                                if ($scope.testPlans[i].id == $scope.testCases[0].id) {
                                    ind = i;
                                    break;
                                }
                            }
                            if (ind > -1) {
                                $scope.testPlans.splice(ind, 1);
                            }
                            $scope.testCases = [];
                            $scope.selectedTestCase = null;
                        }
                        Notification.success({
                            message: "Test Plan deleted successfully !",
                            templateUrl: "NotificationSuccessTemplate.html",
                            scope: $rootScope,
                            delay: 5e3
                        });
                    } else {
                        $scope.error = result.message;
                    }
                }, function(error) {
                    $scope.error = "Sorry, Cannot delete the test plan. Please try again. \n DEBUG:" + error;
                });
            }
        }, function(result) {});
    };
    $scope.editNodeName = function(node) {
        node.editName = node.name;
        node.edit = true;
        node.disableEdit = false;
    };
    $scope.resetNodeName = function(node) {
        node.editName = null;
        node.edit = false;
    };
    $scope.deleteTestNode = function(node) {
        if (node.editName != node.name) {
            if (node.type === "TestPlan") {
                $scope.deleteTestPlan(node);
            } else if (node.type === "TestCaseGroup") {
                $scope.deleteTestCaseGroup(node);
            } else if (node.type === "TestCase") {
                $scope.deleteTestCase(node);
            } else if (node.type === "TestStep") {
                $scope.deleteTestStep(node);
            }
        }
    };
    $scope.saveNodeName = function(node) {
        node.disableEdit = true;
        if (node.editName != node.name) {
            if (node.type === "TestPlan") {
                CBTestPlanManager.updateTestPlanName(node).then(function() {
                    node.name = node.editName;
                    node.label = node.name;
                    node.edit = false;
                    node.editName = null;
                }, function(error) {
                    $scope.error = "Could not saved the name, please try again";
                });
            } else if (node.type === "TestCaseGroup") {
                CBTestPlanManager.updateTestCaseGroupName(node).then(function() {
                    node.name = node.editName;
                    node.label = node.name;
                    node.edit = false;
                    node.editName = null;
                }, function(error) {
                    $scope.error = "Could not saved the name, please try again";
                });
            } else if (node.type === "TestCase") {
                CBTestPlanManager.updateTestCaseName(node).then(function() {
                    node.name = node.editName;
                    node.label = node.name;
                    node.edit = false;
                    node.editName = null;
                }, function(error) {
                    $scope.error = "Could not saved the name, please try again";
                });
            } else if (node.type === "TestStep") {
                CBTestPlanManager.updateTestStepName(node).then(function() {
                    node.name = node.editName;
                    node.label = node.position + "." + node.name;
                    node.editName = null;
                    node.edit = false;
                }, function(error) {
                    $scope.error = "Could not saved the name, please try again";
                });
            }
        } else {
            node.edit = false;
            node.editName = null;
        }
    };
    $scope.publishTestPlan = function() {
        var modalInstance = $modal.open({
            templateUrl: "views/cb/manage/confirm-publish-testplan.html",
            controller: "ConfirmDialogCtrl",
            size: "md",
            backdrop: "static",
            keyboard: false
        });
        modalInstance.result.then(function(result) {
            if (result) {
                $scope.loading = true;
                CBTestPlanManager.publishTestPlan($scope.selectedTestCase.id).then(function(result) {
                    if (result.status === "SUCCESS") {
                        $scope.selectedScope.key = "GLOBAL";
                        Notification.success({
                            message: "Test Plan successfully published !",
                            templateUrl: "NotificationSuccessTemplate.html",
                            scope: $rootScope,
                            delay: 5e3
                        });
                        $scope.selectScope();
                        $scope.selectedTP.id = $scope.selectedTestCase.id;
                        $scope.selectTP();
                    } else {
                        Notification.error({
                            message: result.message,
                            templateUrl: "NotificationErrorTemplate.html",
                            scope: $rootScope,
                            delay: 1e4
                        });
                    }
                    $scope.loading = false;
                }, function(error) {
                    $scope.loading = false;
                    Notification.error({
                        message: error.data,
                        templateUrl: "NotificationErrorTemplate.html",
                        scope: $rootScope,
                        delay: 1e4
                    });
                });
            }
        });
    };
    $scope.unpublishTestPlan = function() {
        var modalInstance = $modal.open({
            templateUrl: "views/cb/manage/confirm-unpublish-testplan.html",
            controller: "ConfirmDialogCtrl",
            size: "md",
            backdrop: "static",
            keyboard: false
        });
        modalInstance.result.then(function(result) {
            if (result) {
                $scope.loading = true;
                CBTestPlanManager.unpublishTestPlan($scope.selectedTestCase.id).then(function(result) {
                    if (result.status === "SUCCESS") {
                        $scope.selectedScope.key = "USER";
                        Notification.success({
                            message: "Test Plan successfully unpublished !",
                            templateUrl: "NotificationSuccessTemplate.html",
                            scope: $rootScope,
                            delay: 5e3
                        });
                        $scope.selectScope();
                        $scope.selectedTP.id = $scope.selectedTestCase.id;
                        $scope.selectTP();
                    } else {
                        Notification.error({
                            message: result.message,
                            templateUrl: "NotificationErrorTemplate.html",
                            scope: $rootScope,
                            delay: 1e4
                        });
                    }
                    $scope.loading = false;
                }, function(error) {
                    $scope.loading = false;
                    Notification.error({
                        message: error.data,
                        templateUrl: "NotificationErrorTemplate.html",
                        scope: $rootScope,
                        delay: 1e4
                    });
                });
            }
        });
    };
    $scope.openUploadTestPlanModal = function() {
        $modalStack.dismissAll("close");
        var modalInstance = $modal.open({
            templateUrl: "views/cb/manage/upload.html",
            controller: "CBUploadCtrl",
            controllerAs: "ctrl",
            windowClass: "upload-modal",
            backdrop: "static",
            keyboard: false
        });
        modalInstance.result.then(function(result) {
            if (result.id != null) {
                $scope.selectedScope.key = "USER";
                $scope.selectScope();
                $scope.selectedTP.id = result.id;
                $scope.selectTP();
            }
        });
    };
    $scope.expandAll = function() {
        $scope.$broadcast("angular-ui-tree:expand-all");
        $scope.testCases.forEach(function(node) {
            $scope.collapse(node, false);
        });
    };
    $scope.collapseAll = function() {
        $scope.$broadcast("angular-ui-tree:collapse-all");
        $scope.testCases.forEach(function(node) {
            $scope.collapse(node, true);
        });
    };
    $scope.collapse = function(node, mode) {
        node.collapsed;
        if (node.children !== undefined) {
            if (node.children.length > 0) {
                node.children.forEach(function(child) {
                    $scope.collapse(child);
                });
            }
        }
    };
    $rootScope.$on("event:logoutConfirmed", function() {
        $scope.initTestCase();
    });
    $rootScope.$on("event:loginConfirmed", function() {
        $scope.initTestCase();
    });
});

angular.module("cb").controller("CBUploadCtrl", [ "$scope", "$http", "$window", "$modal", "$filter", "$rootScope", "$timeout", "StorageService", "TestCaseService", "TestStepService", "FileUploader", "Notification", "$modalInstance", "userInfoService", "CBTestPlanManager", function($scope, $http, $window, $modal, $filter, $rootScope, $timeout, StorageService, TestCaseService, TestStepService, FileUploader, Notification, $modalInstance, userInfoService, CBTestPlanManager) {
    FileUploader.FileSelect.prototype.isEmptyAfterSelection = function() {
        return true;
    };
    $scope.step = 0;
    var zipUploader = $scope.zipUploader = new FileUploader({
        url: "api/cb/management/uploadZip",
        autoUpload: true
    });
    zipUploader.onBeforeUploadItem = function(fileItem) {
        $scope.error = null;
        $scope.loading = true;
        fileItem.formData.push({
            domain: $rootScope.domain.domain
        });
    };
    zipUploader.onCompleteItem = function(fileItem, response, status, headers) {
        $scope.error = null;
        if (response.status == "FAILURE") {
            $scope.step = 1;
            $scope.error = response.message;
            $scope.loading = false;
        } else {
            if (response.status === "SUCCESS") {
                if (response.token !== undefined) {
                    CBTestPlanManager.saveZip(response.token, $scope.domain.domain).then(function(response) {
                        $scope.loading = false;
                        if (response.status == "FAILURE") {
                            $scope.step = 1;
                            $scope.error = "Could not saved the zip, please try again";
                        } else {
                            if (response.action === "ADD") {
                                Notification.success({
                                    message: "Test Plan Added Successfully !",
                                    templateUrl: "NotificationSuccessTemplate.html",
                                    scope: $rootScope,
                                    delay: 5e3
                                });
                                $modalInstance.close({
                                    id: response.id
                                });
                            } else if (response.action === "UPDATE") {
                                Notification.success({
                                    message: "Test Plan Updated Successfully !",
                                    templateUrl: "NotificationSuccessTemplate.html",
                                    scope: $rootScope,
                                    delay: 5e3
                                });
                                $modalInstance.close({
                                    id: response.id
                                });
                            }
                        }
                    }, function(error) {
                        $scope.step = 1;
                        $scope.error = "Could not saved the zip, please try again";
                    });
                } else {
                    $scope.step = 1;
                    $scope.error = "Could not saved the zip, no token was received, please try again";
                }
            }
        }
    };
    $scope.gotStep = function(step) {
        $scope.step = step;
    };
    $scope.dismissModal = function() {
        $modalInstance.dismiss();
    };
    $scope.generateUUID = function() {
        var d = new Date().getTime();
        var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == "x" ? r : r & 3 | 8).toString(16);
        });
        return uuid;
    };
} ]);

angular.module("cb").controller("UploadCBTokenCheckCtrl", [ "$scope", "$http", "CF", "$window", "$modal", "$filter", "$rootScope", "$timeout", "StorageService", "TestCaseService", "TestStepService", "userInfoService", "Notification", "modalService", "$routeParams", "$location", "CBTestPlanManager", function($scope, $http, CF, $window, $modal, $filter, $rootScope, $timeout, StorageService, TestCaseService, TestStepService, userInfoService, Notification, modalService, $routeParams, $location, CBTestPlanManager) {
    $scope.profileCheckToggleStatus = false;
    $scope.token = decodeURIComponent($routeParams.x);
    $scope.auth = decodeURIComponent($routeParams.y);
    $scope.domain = decodeURIComponent($routeParams.d);
    if ($scope.token !== undefined && $scope.auth !== "undefined" && $scope.domain !== undefined) {
        if (!userInfoService.isAuthenticated()) {
            $scope.$emit("event:loginRequestWithAuth", $scope.auth, "/addcbprofiles?x=" + $scope.token + "&d=" + $scope.domain);
        } else {
            $location.url("/addcbprofiles?x=" + $scope.token + "&d=" + $scope.domain);
        }
    } else if ($scope.token !== undefined && $scope.auth === "undefined" && $scope.domain !== undefined) {
        var modalInstance = $modal.open({
            templateUrl: "views/cb/manage/savingTestPlanModal.html",
            windowClass: "upload-modal",
            backdrop: "static",
            keyboard: false
        });
        CBTestPlanManager.saveZip($scope.token, $scope.domain).then(function(response) {
            modalInstance.close();
            if (response.status == "FAILURE") {
                Notification.error({
                    message: "An error occured while adding the Test Plan. Please try again or contact the administator for help",
                    templateUrl: "NotificationErrorTemplate.html",
                    scope: $rootScope,
                    delay: 1e4
                });
                $scope.error = "Could not saved the zip, please try again";
                modalInstance.close();
            } else {
                Notification.success({
                    message: "Test Plan added successfully!",
                    templateUrl: "NotificationSuccessTemplate.html",
                    scope: $rootScope,
                    delay: 5e3
                });
                modalInstance.close();
                $location.url("/cb?scope=USER&group=" + response.id);
            }
        }, function(error) {
            $scope.error = "Could not saved the zip, please try again";
            modalInstance.close();
        });
    }
} ]);

"use strict";

angular.module("envelope").controller("EnvelopeTestingCtrl", [ "$scope", "$window", "$rootScope", "Envelope", "StorageService", function($scope, $window, $rootScope, Envelope, StorageService) {
    $scope.loading = false;
    $scope.error = null;
    $scope.tabs = new Array();
    $scope.testCaseLoaded = null;
    $scope.setActiveTab = function(value) {
        $scope.tabs[0] = false;
        $scope.tabs[1] = false;
        $scope.tabs[2] = false;
        $scope.activeTab = value;
        $scope.tabs[$scope.activeTab] = true;
    };
    $scope.initTesting = function() {
        var tab = StorageService.get(StorageService.ACTIVE_SUB_TAB_KEY);
        if (tab == null || tab != "/envelope_execution") tab = "/envelope_testcase";
        $rootScope.setSubActive(tab);
    };
    $rootScope.$on("env:testCaseLoaded", function(event, testCase, tab) {
        $scope.testCaseLoaded = Envelope.testCase;
        if (Envelope.testCase != null && Envelope.testCase.id != null) {
            $rootScope.setSubActive(tab && tab != null ? tab : "/envelope_execution");
        }
    });
    $scope.hasContent = function() {
        return Envelope.getContent() != "" && Envelope.getContent() != null;
    };
    $scope.disabled = function() {
        return Envelope.testCase == null || Envelope.testCase.id === null;
    };
} ]);

angular.module("envelope").controller("EnvelopeExecutionCtrl", [ "$scope", "$window", "$rootScope", "Envelope", function($scope, $window, $rootScope, Envelope) {
    $scope.loading = true;
    $scope.error = null;
    $scope.tabs = new Array();
    $scope.testCase = Envelope.testCase;
    $scope.setActiveTab = function(value) {
        $scope.tabs[0] = false;
        $scope.tabs[1] = false;
        $scope.activeTab = value;
        $scope.tabs[$scope.activeTab] = true;
    };
    $scope.getTestType = function() {
        return $scope.testCase != null ? $scope.testCase.type : "";
    };
    $scope.initExecution = function() {
        $scope.error = null;
        $scope.loading = false;
        $rootScope.$on("env:testCaseLoaded", function(event, testCase) {
            $scope.setActiveTab(0);
            $scope.testCase = Envelope.testCase;
        });
    };
} ]);

angular.module("envelope").controller("EnvelopeTestCaseCtrl", [ "$scope", "$window", "$rootScope", "Envelope", "EnvelopeTestCaseListLoader", "$timeout", "StorageService", "TestCaseService", function($scope, $window, $rootScope, Envelope, EnvelopeTestCaseListLoader, $timeout, StorageService, TestCaseService) {
    $scope.selectedTestCase = Envelope.selectedTestCase;
    $scope.testCase = Envelope.testCase;
    $scope.testCases = [];
    $scope.loading = true;
    $scope.error = null;
    $scope.tree = {};
    var testCaseService = new TestCaseService();
    $scope.initTestCase = function() {
        $scope.error = null;
        $scope.testCases = [];
        $scope.loading = true;
        var tcLoader = new EnvelopeTestCaseListLoader();
        tcLoader.then(function(testCases) {
            $scope.error = null;
            $scope.testCases = testCases;
            $scope.tree.build_all($scope.testCases);
            var testCase = null;
            var id = StorageService.get(StorageService.SOAP_ENV_SELECTED_TESTCASE_ID_KEY);
            var type = StorageService.get(StorageService.SOAP_ENV_SELECTED_TESTCASE_TYPE_KEY);
            if (id != null && type != null) {
                for (var i = 0; i < $scope.testCases.length; i++) {
                    var found = testCaseService.findOneByIdAndType(id, type, $scope.testCases[i]);
                    if (found != null) {
                        testCase = found;
                        break;
                    }
                }
                if (testCase != null) {
                    $scope.selectTestCase(testCase);
                    $scope.selectNode(id, type);
                }
            }
            testCase = null;
            id = StorageService.get(StorageService.SOAP_ENV_LOADED_TESTCASE_ID_KEY);
            type = StorageService.get(StorageService.SOAP_ENV_LOADED_TESTCASE_TYPE_KEY);
            if (id != null && type != null) {
                for (var i = 0; i < $scope.testCases.length; i++) {
                    var found = testCaseService.findOneByIdAndType(id, type, $scope.testCases[i]);
                    if (found != null) {
                        testCase = found;
                        break;
                    }
                }
                if (testCase != null) {
                    var tab = StorageService.get(StorageService.ACTIVE_SUB_TAB_KEY);
                    $scope.loadTestCase(testCase, tab);
                }
            }
            $scope.expandAll();
            $scope.loading = false;
        }, function(error) {
            $scope.loading = false;
            $scope.error = "Sorry,Cannot fetch the test cases. Please refresh the page.";
        });
    };
    $scope.refreshEditor = function() {
        $timeout(function() {
            $scope.$broadcast("envelope:editor:init");
        });
    };
    $scope.selectTestCase = function(node) {
        $timeout(function() {
            $scope.selectedTestCase = node;
            StorageService.set(StorageService.SOAP_ENV_SELECTED_TESTCASE_ID_KEY, node.id);
            StorageService.set(StorageService.SOAP_ENV_SELECTED_TESTCASE_TYPE_KEY, node.type);
            $timeout(function() {
                $rootScope.$broadcast("env:testCaseSelected");
            });
        });
    };
    $scope.selectNode = function(id, type) {
        $timeout(function() {
            testCaseService.selectNodeByIdAndType($scope.tree, id, type);
        });
    };
    $scope.loadTestCase = function(testCase, tab) {
        if (Envelope.editor.instance != null) {
            Envelope.editor.instance.setOption("readOnly", false);
        }
        if (testCase.type === "TestCase") {
            Envelope.testCase = testCase;
            $scope.testCase = Envelope.testCase;
            var id = StorageService.get(StorageService.SOAP_ENV_LOADED_TESTCASE_ID_KEY);
            var type = StorageService.get(StorageService.SOAP_ENV_LOADED_TESTCASE_TYPE_KEY);
            if (id != $scope.testCase.id || type != $scope.testCase.type) {
                StorageService.set(StorageService.SOAP_ENV_LOADED_TESTCASE_ID_KEY, $scope.testCase.id);
                StorageService.set(StorageService.SOAP_ENV_LOADED_TESTCASE_TYPE_KEY, $scope.testCase.type);
                StorageService.remove(StorageService.SOAP_ENV_EDITOR_CONTENT_KEY);
            }
            $timeout(function() {
                $rootScope.$broadcast("env:testCaseLoaded", $scope.testCase, tab);
            });
        }
    };
    $scope.isSelectable = function(node) {
        return true;
    };
    $scope.expandAll = function() {
        if ($scope.tree != null) $scope.tree.expand_all();
    };
    $scope.collapseAll = function() {
        if ($scope.tree != null) $scope.tree.collapse_all();
    };
} ]);

angular.module("envelope").controller("EnvelopeValidatorCtrl", [ "$scope", "$http", "$window", "SOAPFormatter", "Envelope", "SOAPEditorUtils", "$rootScope", "SOAPParser", "SOAPTreeUtils", "EnvelopeValidator", "$timeout", "StorageService", "FileUpload", "Notification", function($scope, $http, $window, SOAPFormatter, Envelope, SOAPEditorUtils, $rootScope, SOAPParser, SOAPTreeUtils, EnvelopeValidator, $timeout, StorageService, FileUpload, Notification) {
    $scope.testCase = Envelope.testCase;
    $scope.selectedTestCase = Envelope.selectedTestCase;
    $scope.vLoading = true;
    $scope.vError = null;
    $scope.selectedMessage = {
        id: -1,
        content: ""
    };
    $scope.eLoading = false;
    $scope.validating = false;
    $scope.editorInit = false;
    $scope.eError = null;
    $scope.vLoading = false;
    $scope.vError = null;
    $scope.resized = false;
    $scope.validationSettings = Envelope.validationSettings;
    $scope.validationResult = Envelope.validationResult;
    $scope.errors = $scope.validationResult.errors;
    $scope.errorsCollection = [].concat($scope.errors.data);
    $scope.affirmatives = $scope.validationResult.affirmatives;
    $scope.affirmativesCollection = [].concat($scope.affirmatives.data);
    $scope.alerts = $scope.validationResult.alerts;
    $scope.alertsCollection = [].concat($scope.alerts.data);
    $scope.ignores = $scope.validationResult.ignores;
    $scope.ignoresCollection = [].concat($scope.ignores.data);
    $scope.warnings = $scope.validationResult.warnings;
    $scope.warningsCollection = [].concat($scope.warnings.data);
    $scope.tError = null;
    $scope.envelopeTree = {};
    $scope.tLoading = false;
    $scope.refreshEditor = function() {
        if ($scope.editor != undefined) {
            $timeout(function() {
                $scope.editor.refresh();
            }, 1e3);
        }
    };
    $scope.loadExampleMessage = function() {
        var content = Envelope.testCase.testContext.exampleMessage.content;
        var formatter = new SOAPFormatter(content);
        formatter.then(function(formatted) {
            $scope.message(formatted);
        }, function(error) {
            $scope.error = error;
            $scope.message(content);
        });
    };
    $scope.message = function(message) {
        Envelope.message.content = message;
        Envelope.editor.instance.doc.setValue(message);
        StorageService.set(StorageService.SOAP_ENV_EDITOR_CONTENT_KEY, message);
        $scope.refreshEditor();
        $scope.validateMessage();
        $scope.parse();
    };
    $scope.validate = function() {
        $scope.vError = null;
        var backup = Envelope.editor.instance.doc.getValue();
        if (backup != "") {
            $scope.vLoading = true;
            var formatter = new SOAPFormatter(backup);
            formatter.then(function(formatted) {
                $scope.vLoading = false;
                $scope.message(formatted);
            }, function(error) {
                $scope.vLoading = false;
                $scope.vError = error;
                $scope.setValidationResult({});
                if (typeof $scope.envelopeTree.build_all == "function") {
                    $scope.envelopeTree.build_all([]);
                }
            });
        } else {
            $scope.message("");
        }
    };
    $scope.initValidation = function() {
        $scope.editor = CodeMirror.fromTextArea(document.getElementById("envelopeTextArea"), {
            lineNumbers: true,
            fixedGutter: true,
            mode: "xml",
            readOnly: false,
            showCursorWhenSelecting: true
        });
        $scope.editor.on("dblclick", function(editor) {
            $scope.$apply(function() {
                Envelope.cursor.setLine(editor.doc.getCursor(true).line + 1);
            });
        });
        $scope.editor.setSize("100%", 300);
        Envelope.editor.init($scope.editor);
        $scope.tLoading = false;
        $scope.$watch(function() {
            return Envelope.cursor.updateIndicator;
        }, function() {
            SOAPEditorUtils.select(Envelope.cursor, $scope.editor);
        }, true);
        $scope.$watch(function() {
            return Envelope.cursor.toString();
        }, function() {
            SOAPTreeUtils.selectNode($scope.envelopeTree, Envelope.cursor);
        }, true);
        $rootScope.$on("env:testCaseLoaded", function(event) {
            $scope.testCase = Envelope.testCase;
            var content = StorageService.get(StorageService.SOAP_ENV_EDITOR_CONTENT_KEY) == null ? "" : StorageService.get(StorageService.SOAP_ENV_EDITOR_CONTENT_KEY);
            $scope.message(content);
        });
        $scope.setValidationResult({});
        $scope.refreshEditor();
    };
    $scope.uploadMessage = function(file, errFiles) {
        $scope.f = file;
        FileUpload.uploadMessage(file, errFiles).then(function(response) {
            $timeout(function() {
                file.result = response.data;
                var result = response.data;
                var fileName = file.name;
                var tmp = angular.fromJson(result);
                $scope.message(result.content);
                $scope.uploadError = null;
                $scope.fileName = fileName;
                Notification.success({
                    message: "File " + fileName + " successfully uploaded!",
                    templateUrl: "NotificationSuccessTemplate.html",
                    scope: $rootScope,
                    delay: 3e4
                });
            });
        }, function(response) {
            $scope.uploadError = response.data;
        });
    };
    $scope.getMessageName = function() {
        return Envelope.message.name;
    };
    $scope.clearMessage = function() {
        $scope.error = null;
        $scope.message("");
    };
    $scope.saveMessage = function() {
        Envelope.message.download();
    };
    $scope.resize = function() {};
    $scope.validateMessage = function() {
        $scope.vLoading = true;
        $scope.vError = null;
        if (Envelope.testCase.id != null && Envelope.editor.instance != null && Envelope.editor.instance.doc.getValue() != "") {
            var validated = new EnvelopeValidator().validate(Envelope.message.content, Envelope.testCase.id);
            validated.then(function(result) {
                $scope.vLoading = false;
                $scope.setValidationResult(result);
            }, function(error) {
                $scope.vLoading = false;
                $scope.vError = error;
                $scope.setValidationResult({});
            });
        } else {
            $scope.setValidationResult({});
            $scope.vLoading = false;
            $scope.vError = null;
        }
    };
    $scope.setValidationResult = function(result) {
        Envelope.validationResult.init(result);
        $scope.validationResult = Envelope.validationResult;
        $scope.errors = $scope.validationResult.errors;
        $scope.affirmatives = $scope.validationResult.affirmatives;
        $scope.alerts = $scope.validationResult.alerts;
        $scope.ignores = $scope.validationResult.ignores;
        $scope.warnings = $scope.validationResult.warnings;
        $timeout(function() {
            $rootScope.$emit("env:validationResultLoaded");
        });
    };
    $scope.select = function(element) {
        if (element.line != -1) {
            Envelope.cursor.setLine(element.line);
        }
    };
    $scope.parse = function() {
        $scope.tLoading = true;
        $scope.tError = null;
        if (Envelope.testCase.id !== null && Envelope.getContent() != "") {
            var loader = new SOAPParser(Envelope.getContent());
            loader.then(function(value) {
                $scope.tLoading = false;
                $scope.envelopeTree.build_all(value);
                SOAPTreeUtils.expandTree($scope.envelopeTree);
            }, function(tError) {
                $scope.tLoading = false;
                $scope.tError = tError;
                $scope.envelopeTree.build_all([]);
            });
        } else {
            $scope.tLoading = false;
            $scope.envelopeTree.build_all([]);
        }
    };
    $scope.onEnvelopeNodeSelect = function(node) {
        SOAPTreeUtils.setCoordinate(node, Envelope.cursor);
    };
    $scope.expandAll = function() {
        if ($scope.envelopeTree != null) $scope.envelopeTree.expand_all();
    };
    $scope.collapseAll = function() {
        if ($scope.envelopeTree != null) $scope.envelopeTree.collapse_all();
    };
} ]);

"use strict";

angular.module("envelope").controller("EnvelopeReportCtrl", [ "$scope", "$sce", "$http", "Envelope", "$rootScope", function($scope, $sce, $http, Envelope, $rootScope) {
    $scope.error = null;
    $scope.loading = false;
    $scope.testCase = Envelope.testCase;
    $scope.report = Envelope.report;
    $rootScope.$on("env:validationResultLoaded", function() {
        var xmlReport = Envelope.validationResult.xml;
        if (xmlReport != null && xmlReport != "") {
            $scope.loading = true;
            var promise = Envelope.report.generate(xmlReport);
            promise.then(function(json) {
                $scope.loading = false;
                $scope.error = null;
            }, function(error) {
                $scope.error = "Failed to generate the report";
                $scope.loading = false;
            });
        } else {
            $scope.loading = false;
            $scope.error = null;
        }
    });
    $rootScope.$on("env:testCaseLoaded", function(event) {
        $scope.testCase = Envelope.testCase;
    });
    $scope.downloadAs = function(format) {
        $scope.report.download(format, Envelope.testCase.label, Envelope.validationResult.xml);
    };
} ]);

"use strict";

angular.module("connectivity").controller("ConnectivityTestingCtrl", [ "$scope", "Connectivity", "$rootScope", "StorageService", function($scope, Connectivity, $rootScope, StorageService) {
    $scope.testCaseLoaded = null;
    $scope.initTesting = function() {
        var tab = StorageService.get(StorageService.ACTIVE_SUB_TAB_KEY);
        if (tab == null || tab != "/connectivity_execution") tab = "/connectivity_testcase";
        $rootScope.setSubActive(tab);
    };
    $rootScope.$on("conn:testCaseLoaded", function(event, tab) {
        $scope.testCaseLoaded = Connectivity.testCase;
        $rootScope.setSubActive(tab && tab != null ? tab : "/connectivity_execution");
    });
} ]);

angular.module("connectivity").controller("ConnectivityTestCaseCtrl", [ "$scope", "Connectivity", "$rootScope", "ConnectivityTestCaseListLoader", "$cookies", "$timeout", "StorageService", "TestCaseService", function($scope, Connectivity, $rootScope, ConnectivityTestCaseListLoader, $cookies, $timeout, StorageService, TestCaseService) {
    $scope.connectivity = Connectivity;
    $scope.loading = true;
    $scope.error = null;
    $scope.testCases = [];
    $scope.tree = {};
    $scope.testCase = Connectivity.testCase;
    $scope.selectedTestCase = Connectivity.selectedTestCase;
    var testCaseService = new TestCaseService();
    $scope.selectTestCase = function(node) {
        $timeout(function() {
            $scope.selectedTestCase = node;
            StorageService.set(StorageService.SOAP_CONN_SELECTED_TESTCASE_ID_KEY, node.id);
            StorageService.set(StorageService.SOAP_CONN_SELECTED_TESTCASE_TYPE_KEY, node.type);
            $timeout(function() {
                $rootScope.$broadcast("conn:testCaseSelected");
            });
        });
    };
    $scope.initTestCase = function() {
        $scope.error = null;
        $scope.loading = true;
        $scope.testCases = [];
        var tcLoader = new ConnectivityTestCaseListLoader();
        tcLoader.then(function(testCases) {
            $scope.testCases = testCases;
            $scope.tree.build_all($scope.testCases);
            var testCase = null;
            var id = StorageService.get(StorageService.SOAP_CONN_SELECTED_TESTCASE_ID_KEY);
            var type = StorageService.get(StorageService.SOAP_CONN_SELECTED_TESTCASE_TYPE_KEY);
            if (id != null && type != null) {
                for (var i = 0; i < $scope.testCases.length; i++) {
                    var found = testCaseService.findOneByIdAndType(id, type, $scope.testCases[i]);
                    if (found != null) {
                        testCase = found;
                        break;
                    }
                }
                if (testCase != null) {
                    $scope.selectTestCase(testCase);
                    $scope.selectNode(id, type);
                }
            }
            testCase = null;
            id = StorageService.get(StorageService.SOAP_CONN_LOADED_TESTCASE_ID_KEY);
            type = StorageService.get(StorageService.SOAP_CONN_LOADED_TESTCASE_TYPE_KEY);
            if (id != null && type != null) {
                for (var i = 0; i < $scope.testCases.length; i++) {
                    var found = testCaseService.findOneByIdAndType(id, type, $scope.testCases[i]);
                    if (found != null) {
                        testCase = found;
                        break;
                    }
                }
                if (testCase != null) {
                    var tab = StorageService.get(StorageService.ACTIVE_SUB_TAB_KEY);
                    $scope.loadTestCase(testCase, tab);
                }
            }
            $scope.expandAll();
            $scope.loading = false;
            $scope.error = null;
        }, function(error) {
            $scope.error = "Sorry, Failed to fetch the test cases. Please refresh page and try again.";
            $scope.loading = false;
        });
    };
    $scope.loadTestCase = function(testCase, tab) {
        Connectivity.testCase = testCase;
        $scope.testCase = Connectivity.testCase;
        var id = StorageService.get(StorageService.SOAP_CONN_LOADED_TESTCASE_ID_KEY);
        var type = StorageService.get(StorageService.SOAP_CONN_LOADED_TESTCASE_TYPE_KEY);
        if (id != $scope.testCase.id || type != $scope.testCase.type) {
            StorageService.set(StorageService.SOAP_CONN_LOADED_TESTCASE_ID_KEY, $scope.testCase.id);
            StorageService.set(StorageService.SOAP_CONN_LOADED_TESTCASE_TYPE_KEY, $scope.testCase.type);
            StorageService.remove(StorageService.SOAP_CONN_REQ_EDITOR_CONTENT_KEY);
            StorageService.remove(StorageService.SOAP_CONN_RESP_EDITOR_CONTENT_KEY);
        }
        $timeout(function() {
            $rootScope.$broadcast("conn:testCaseLoaded", tab);
        });
    };
    $scope.isSelectable = function(node) {
        return true;
    };
    $scope.selectNode = function(id, type) {
        $timeout(function() {
            testCaseService.selectNodeByIdAndType($scope.tree, id, type);
        }, 0);
    };
    $scope.expandAll = function() {
        if ($scope.tree != null) $scope.tree.expand_all();
    };
    $scope.collapseAll = function() {
        if ($scope.tree != null) $scope.tree.collapse_all();
    };
} ]);

angular.module("connectivity").controller("ConnectivityExecutionCtrl", [ "$scope", "$timeout", "$interval", "Connectivity", "$rootScope", "$modal", "Endpoint", "$cookies", "StorageService", "TestExecutionClock", "SOAPConnectivityTransport", "SOAPFormatter", function($scope, $timeout, $interval, Connectivity, $rootScope, $modal, Endpoint, $cookies, StorageService, TestExecutionClock, SOAPConnectivityTransport, SOAPFormatter) {
    $scope.logger = Connectivity.logger;
    $scope.loading = false;
    $scope.testCase = Connectivity.testCase;
    $scope.selectedTestCase = Connectivity.selectedTestCase;
    $scope.loading = false;
    $scope.connecting = false;
    $scope.error = null;
    $scope.endpoint = null;
    $scope.transport = SOAPConnectivityTransport;
    $scope.hidePwd = true;
    $scope.initExecution = function() {
        $rootScope.$on("conn:testCaseLoaded", function(event) {
            $scope.testCase = Connectivity.testCase;
            $scope.logger.init();
            $scope.loading = true;
            $scope.error = null;
            $scope.connecting = false;
            TestExecutionClock.stop();
            SOAPConnectivityTransport.init();
        });
    };
    $scope.log = function(log) {
        $scope.logger.log(log);
    };
    $scope.isValidConfig = function() {
        var domain = $rootScope.domain.domain;
        var protocol = SOAPConnectivityTransport.protocol;
        var taInitiator = $scope.transport.configs && $scope.transport.configs != null && $scope.transport.configs[protocol] && $scope.transport.configs[protocol] != null && $scope.transport.configs[protocol].data && $scope.transport.configs[protocol].data != null ? $scope.transport.configs[protocol].data.taInitiator : null;
        return taInitiator && taInitiator != null && taInitiator.endpoint != null && taInitiator.endpoint != "";
    };
    $scope.openReceiverConfig = function() {
        $scope.logger.init();
        var modalInstance = $modal.open({
            templateUrl: "TransactionReceiver.html",
            controller: "ConnectivityReceiverCtrl",
            windowClass: "app-modal-window",
            resolve: {
                testCase: function() {
                    return Connectivity.testCase;
                },
                logger: function() {
                    return Connectivity.logger;
                },
                message: function() {
                    return Connectivity.request.getContent();
                }
            }
        });
        modalInstance.result.then(function(result) {
            if (result.received != null) {
                $scope.triggerReqEvent(result.received);
            }
            if (result.sent != null) {
                $scope.triggerRespEvent(result.sent);
            }
        }, function() {
            $scope.triggerReqEvent("");
            $scope.triggerRespEvent("");
        });
    };
    $scope.hasRequestContent = function() {
        return $scope.message != null && $scope.message != "";
    };
    $scope.send = function() {
        $scope.error = null;
        if ($scope.isValidConfig() && $scope.hasRequestContent()) {
            $scope.connecting = true;
            $scope.logger.init();
            var modalInstance = $modal.open({
                templateUrl: "SOAPConnectivityConsole.html",
                controller: "SOAPConnectivityConsoleCtrl",
                size: "lg",
                backdrop: "static",
                resolve: {
                    logger: function() {
                        return $scope.logger;
                    }
                }
            });
            $scope.received = "";
            $scope.logger.log("Sending outbound message. Please wait...");
            var sender = $scope.transport.send($scope.testCase.id);
            sender.then(function(response) {
                var received = response.incoming;
                var sent = response.outgoing;
                $scope.logger.log("Outbound Message  -------------------------------------->");
                if (sent != null && sent != "") {
                    $scope.logger.log(sent);
                    Connectivity.request.message.content = sent;
                    $scope.triggerReqEvent(sent);
                    $scope.logger.log("Inbound Message  <--------------------------------------");
                    if (received != null && received != "") {
                        $scope.logger.log(received);
                        $scope.triggerRespEvent(received);
                    } else {
                        $scope.logger.log("No Inbound message received");
                    }
                } else {
                    $scope.logger.log("No outbound message sent");
                }
                $scope.connecting = false;
                $scope.logger.log("Transaction completed");
            }, function(error) {
                $scope.connecting = false;
                $scope.error = error.data;
                $scope.logger.log("Error: " + error.data);
                $scope.logger.log("Transaction completed");
                $scope.triggerRespEvent("");
            });
        } else {
            $scope.error = "No Outbound message found";
            $scope.connecting = false;
            $scope.triggerRespEvent("");
        }
    };
    $scope.configureReceiver = function() {
        var modalInstance = $modal.open({
            templateUrl: "TransactionConfigureReceiver.html",
            controller: "ConnectivityConfigureReceiverCtrl",
            windowClass: "app-modal-window",
            backdrop: "static",
            keyboard: false
        });
        modalInstance.result.then(function(config) {
            if (config && config.hl7Message != null && config.hl7Message != "") {
                var xml = $scope.generateNewSoapRequest(config);
                var formatter = new SOAPFormatter(xml);
                formatter.then(function(formatted) {
                    $scope.triggerReqEvent(formatted);
                }, function(error) {
                    $scope.triggerReqEvent(xml);
                });
            }
        }, function(result) {});
    };
    $scope.generateNewSoapRequest = function(config) {
        var message = Connectivity.request.getContent();
        if (message != null && message != "") {
            var x2js = new X2JS();
            var json = x2js.xml_str2json(message);
            json.Envelope.Body.submitSingleMessage.hl7Message = config.hl7Message;
            json.Envelope.Body.submitSingleMessage.username = config.username;
            json.Envelope.Body.submitSingleMessage.password = config.password;
            json.Envelope.Body.submitSingleMessage.facilityID = config.facilityID;
            var xml = x2js.json2xml_str(json);
            return xml;
        }
        return null;
    };
    $scope.hasRequestContent = function() {
        return Connectivity.request.getContent() != null && Connectivity.request.getContent() != "";
    };
    $scope.triggerReqEvent = function(message) {
        $timeout(function() {
            $rootScope.$broadcast("conn:reqMessage", message);
        });
    };
    $scope.triggerRespEvent = function(message) {
        $timeout(function() {
            $rootScope.$broadcast("conn:respMessage", message);
        });
    };
} ]);

"use strict";

angular.module("connectivity").controller("ConnectivityReqCtrl", [ "$scope", "$http", "Connectivity", "SOAPFormatter", "$window", "SOAPEditorUtils", "$timeout", "$rootScope", "ConnectivityValidator", "$modal", "StorageService", function($scope, $http, Connectivity, SOAPFormatter, $window, SOAPEditorUtils, $timeout, $rootScope, ConnectivityValidator, $modal, StorageService) {
    $scope.eLoading = false;
    $scope.vError = null;
    $scope.request = Connectivity.request;
    $scope.editor = null;
    $scope.request = Connectivity.request;
    $scope.validating = false;
    $scope.editorInit = false;
    $scope.serverEndpoint = Connectivity.serverEndpoint;
    $scope.request = Connectivity.request;
    $scope.rLoading = false;
    $scope.rError = null;
    $scope.resized = false;
    $scope.validationSettings = $scope.request.validationSettings;
    $scope.validationResult = $scope.request.validationResult;
    $scope.editor = $scope.request.editor;
    $scope.itemsByPage = 10;
    $scope.errors = $scope.validationResult.errors;
    $scope.errorsCollection = [].concat($scope.errors.data);
    $scope.affirmatives = $scope.validationResult.affirmatives;
    $scope.affirmativesCollection = [].concat($scope.affirmatives.data);
    $scope.alerts = $scope.validationResult.alerts;
    $scope.alertsCollection = [].concat($scope.alerts.data);
    $scope.ignores = $scope.validationResult.ignores;
    $scope.ignoresCollection = [].concat($scope.ignores.data);
    $scope.warnings = $scope.validationResult.warnings;
    $scope.warningsCollection = [].concat($scope.warnings.data);
    $scope.selectedExampleMessage = {
        id: -1,
        content: ""
    };
    $scope.error = null;
    $scope.hasContent = function() {
        return $scope.request.getContent() != "" && $scope.request.getContent() != null;
    };
    $scope.getMessageName = function() {
        return $scope.editor.message.name;
    };
    $scope.$on("fileuploadadd", function(e, data) {
        if (data.autoUpload || data.autoUpload !== false && $(this).fileupload("option", "autoUpload")) {
            data.process().done(function() {
                var fileName = data.files[0].name;
                data.url = "api/message/upload";
                var jqXHR = data.submit().success(function(result, textStatus, jqXHR) {
                    var tmp = angular.fromJson(result);
                    $scope.request.editor.instance.doc.setValue(tmp.content);
                    $scope.uploadError = null;
                    $scope.fileName = fileName;
                }).error(function(jqXHR, textStatus, errorThrown) {
                    $scope.fileName = fileName;
                    $scope.uploadError = "Sorry, Failed to upload file: " + fileName + ", Error: " + errorThrown;
                }).complete(function(result, textStatus, jqXHR) {});
            });
        }
    });
    $scope.validate = function() {
        $scope.vError = null;
        var backup = $scope.request.editor.instance.doc.getValue();
        if (backup != null && backup != "") {
            $scope.validating = true;
            var validator = new SOAPFormatter(backup);
            validator.then(function(formatted) {
                $scope.validating = false;
                $scope.reqMessage(formatted);
            }, function(error) {
                $scope.validating = false;
                $scope.vError = error;
            });
        }
    };
    $scope.clearMessage = function() {
        $scope.error = null;
        $scope.reqMessage("");
    };
    $scope.refreshEditor = function() {
        $timeout(function() {
            if ($scope.editor != undefined) {
                $scope.editor.refresh();
            }
        }, 1e3);
    };
    $scope.saveMessage = function() {
        $scope.request.message.download();
    };
    $scope.resize = function() {};
    $scope.validateMessage = function() {
        $scope.refreshEditor();
        $scope.rLoading = true;
        $scope.rError = null;
        if ($scope.testCase != null && $scope.request.getContent() != "") {
            var validator = new ConnectivityValidator().validate($scope.request.message.content, $scope.testCase.id, "req", null);
            validator.then(function(result) {
                $scope.rLoading = false;
                $scope.setValidationResult(result);
            }, function(error) {
                $scope.rLoading = false;
                $scope.rError = error;
                $scope.setValidationResult({});
            });
        } else {
            $scope.setValidationResult({});
            $scope.rLoading = false;
            $scope.rError = null;
        }
    };
    $scope.setValidationResult = function(mvResult) {
        $scope.request.validationResult.init(mvResult);
        $scope.validationResult = $scope.request.validationResult;
        $scope.errors = $scope.validationResult.errors;
        $scope.affirmatives = $scope.validationResult.affirmatives;
        $scope.alerts = $scope.validationResult.alerts;
        $scope.ignores = $scope.validationResult.ignores;
        $scope.warnings = $scope.validationResult.warnings;
    };
    $scope.select = function(element) {
        if (element.line != -1) {
            Connectivity.request.cursor.setLine(element.line);
        }
    };
    $scope.initRequest = function() {
        $scope.error = null;
        $scope.loading = true;
        $scope.editor = CodeMirror.fromTextArea(document.getElementById("connectivityReqTextArea"), {
            lineNumbers: true,
            fixedGutter: true,
            mode: "xml",
            readOnly: false,
            showCursorWhenSelecting: true
        });
        $scope.editor.setOption("readOnly", true);
        $scope.editor.setSize("100%", 300);
        $scope.editor.on("dblclick", function(editor) {
            $scope.$apply(function() {
                $scope.request.cursor.setLine($scope.editor.doc.getCursor(true).line + 1);
            });
        });
        $scope.request.editor.init($scope.editor);
        $rootScope.$on("conn:testCaseLoaded", function(event) {
            $scope.testCase = Connectivity.testCase;
            var req = Connectivity.testCase.sutType == "RECEIVER" ? Connectivity.testCase.testContext.message : StorageService.get(StorageService.SOAP_CONN_REQ_EDITOR_CONTENT_KEY) != null ? StorageService.get(StorageService.SOAP_CONN_REQ_EDITOR_CONTENT_KEY) : "";
            $scope.reqMessage(req);
        });
        $rootScope.$on("conn:reqMessage", function(event, message) {
            $scope.reqMessage(message);
        });
        $scope.$watch(function() {
            return $scope.request.cursor.updateIndicator;
        }, function() {
            SOAPEditorUtils.select($scope.request.cursor, $scope.request.editor.instance);
        }, true);
        $scope.setValidationResult({});
        $scope.refreshEditor();
    };
    $scope.reqMessage = function(message) {
        $scope.request.message.content = message;
        $scope.editor.doc.setValue(message);
        StorageService.set(StorageService.SOAP_CONN_REQ_EDITOR_CONTENT_KEY, message);
        $scope.validateMessage();
    };
    $scope.triggerRespEvent = function(message) {
        $rootScope.$broadcast("conn:respMessage", message);
    };
} ]);

angular.module("connectivity").controller("ConnectivityReqReportCtrl", [ "$scope", "$sce", "$http", "SoapValidationReportGenerator", "SoapValidationReportDownloader", "Connectivity", "$rootScope", function($scope, $sce, $http, SoapValidationReportGenerator, SoapValidationReportDownloader, Connectivity, $rootScope) {
    $scope.connectivityReqHtmlReport = null;
    $scope.error = null;
    $scope.loading = false;
    $scope.testCase = Connectivity.testCase;
    $scope.validationResult = Connectivity.validationResult;
    $scope.init = function() {
        $rootScope.$on("conn:testCaseLoaded", function(event) {
            $scope.testCase = Connectivity.testCase;
        });
        $scope.$watch(function() {
            return $scope.validationResult.xml;
        }, function(xmlReport) {
            if (xmlReport != null && xmlReport != "") {
                $scope.loading = true;
                var promise = new SoapValidationReportGenerator(xmlReport, "html");
                promise.then(function(json) {
                    $scope.connectivityReqHtmlReport = json.htmlReport;
                    $scope.loading = false;
                    $scope.error = null;
                }, function(error) {
                    $scope.error = error;
                    $scope.loading = false;
                    $scope.connectivityReqHtmlReport = null;
                });
            } else {
                $scope.loading = false;
                $scope.connectivityReqHtmlReport = null;
                $scope.error = null;
            }
        }, true);
    };
    $scope.downloadAs = function(format) {
        SoapValidationReportDownloader.downloadAs($scope.validationResult.xml, format);
    };
} ]);

angular.module("connectivity").controller("ConnectivityConfigureReceiverCtrl", function($scope, $sce, $http, Connectivity, $rootScope, $modalInstance, User, SOAPConnectivityTransport, Transport, SOAPEscaper) {
    $scope.testCase = Connectivity.testCase;
    SOAPConnectivityTransport.init();
    var config = SOAPConnectivityTransport.configs[SOAPConnectivityTransport.protocol].data;
    var getHl7Message = function(soapMessage) {
        if (soapMessage != null && soapMessage != "") {
            var x2js = new X2JS();
            var json = x2js.xml_str2json(soapMessage);
            if (json.Envelope.Body.submitSingleMessage && json.Envelope.Body.submitSingleMessage.hl7Message) {
                var hl7Message = SOAPEscaper.decodeXml(json.Envelope.Body.submitSingleMessage.hl7Message.toString());
                return hl7Message;
            }
        }
        return "";
    };
    $scope.config = angular.copy(config.taInitiator);
    $scope.config["hl7Message"] = getHl7Message(Connectivity.request.getContent());
    $scope.save = function() {
        var copyConfig = angular.copy($scope.config);
        delete copyConfig.hl7Message;
        var data = angular.fromJson({
            config: copyConfig,
            userId: User.info.id,
            type: "TA_INITIATOR",
            protocol: SOAPConnectivityTransport.protocol,
            domain: $rootScope.domain.domain
        });
        $http.post("api/transport/config/save", data).then(function(result) {
            SOAPConnectivityTransport.configs[SOAPConnectivityTransport.protocol].data.taInitiator = $scope.config;
            $modalInstance.close($scope.config);
        }, function(error) {
            $scope.error = error.data;
        });
    };
    $scope.cancel = function() {
        $modalInstance.dismiss("cancel");
    };
});

angular.module("connectivity").controller("SOAPConnectivityConsoleCtrl", function($scope, $sce, $http, Connectivity, $rootScope, $modalInstance, logger) {
    $scope.logger = logger;
    $scope.connecting = false;
    $scope.close = function() {
        $modalInstance.close();
    };
    $scope.cancel = function() {
        $modalInstance.dismiss("cancel");
    };
});

angular.module("connectivity").controller("ConnectivityRespCtrl", [ "$scope", "$http", "Connectivity", "$window", "SOAPFormatter", "SOAPEditorUtils", "$timeout", "$rootScope", "ConnectivityValidator", "$modal", "StorageService", function($scope, $http, Connectivity, $window, SOAPFormatter, SOAPEditorUtils, $timeout, $rootScope, ConnectivityValidator, $modal, StorageService) {
    $scope.testCase = Connectivity.testCase;
    $scope.response = Connectivity.response;
    $scope.selectedTestCase = Connectivity.selectedTestCase;
    $scope.loading = true;
    $scope.error = null;
    $scope.eLoading = false;
    $scope.validating = false;
    $scope.editorInit = false;
    $scope.rLoading = false;
    $scope.rError = null;
    $scope.resized = false;
    $scope.validationSettings = Connectivity.response.validationSettings;
    $scope.validationResult = Connectivity.response.validationResult;
    $scope.itemsByPage = 10;
    $scope.errors = $scope.validationResult.errors;
    $scope.errorsCollection = [].concat($scope.errors.data);
    $scope.affirmatives = $scope.validationResult.affirmatives;
    $scope.affirmativesCollection = [].concat($scope.affirmatives.data);
    $scope.alerts = $scope.validationResult.alerts;
    $scope.alertsCollection = [].concat($scope.alerts.data);
    $scope.ignores = $scope.validationResult.ignores;
    $scope.ignoresCollection = [].concat($scope.ignores.data);
    $scope.warnings = $scope.validationResult.warnings;
    $scope.warningsCollection = [].concat($scope.warnings.data);
    $scope.error = null;
    $scope.initResponse = function() {
        $scope.error = null;
        $scope.testCases = [];
        $scope.loading = true;
        $scope.editor = CodeMirror.fromTextArea(document.getElementById("connectivityRespTextArea"), {
            lineNumbers: true,
            fixedGutter: true,
            mode: "xml",
            readOnly: false,
            showCursorWhenSelecting: true
        });
        $scope.editor.setOption("readOnly", true);
        $scope.editor.setSize("100%", 300);
        $scope.editor.on("dblclick", function(editor) {
            $scope.$apply(function() {
                $scope.response.cursor.setLine($scope.editor.doc.getCursor(true).line + 1);
            });
            event.preventDefault();
        });
        $scope.response.editor.init($scope.editor);
        $scope.$watch(function() {
            return $scope.response.cursor.updateIndicator;
        }, function() {
            SOAPEditorUtils.select($scope.response.cursor, $scope.editor);
        }, true);
        $rootScope.$on("conn:testCaseLoaded", function(event) {
            $scope.testCase = Connectivity.testCase;
            $scope.refreshEditor();
            var rsp = StorageService.get(StorageService.SOAP_CONN_RESP_EDITOR_CONTENT_KEY);
            $scope.respMessage(rsp != null ? rsp : "");
        });
        $rootScope.$on("conn:respMessage", function(event, message) {
            $scope.respMessage(message);
        });
        $scope.setValidationResult({});
        $scope.refreshEditor();
    };
    $scope.respMessage = function(message) {
        $scope.response.message.content = message;
        $scope.editor.doc.setValue(message);
        StorageService.set(StorageService.SOAP_CONN_RESP_EDITOR_CONTENT_KEY, message);
        $scope.refreshEditor();
        $scope.validateMessage();
    };
    $scope.triggerReqEvent = function(message) {
        $rootScope.$broadcast("conn:reqMessage", message);
    };
    $scope.triggerRespEvent = function(message) {
        $rootScope.$broadcast("conn:respMessage", message);
    };
    $scope.hasContent = function() {
        return $scope.response.getContent() != "" && $scope.response.getContent() != null;
    };
    $scope.getMessageName = function() {
        return $scope.response.message.name;
    };
    $scope.clearMessage = function() {
        $scope.error = null;
        $scope.respMessage("");
    };
    $scope.refreshEditor = function() {
        if ($scope.editor != undefined) {
            $timeout(function() {
                $scope.editor.refresh();
            }, 1e3);
        }
    };
    $scope.saveMessage = function() {
        $scope.response.message.download();
    };
    $scope.validate = function() {
        $scope.error = null;
        var backup = $scope.response.editor.instance.doc.getValue();
        if (backup != null && backup != "") {
            $scope.validating = true;
            var validator = new SOAPFormatter(backup);
            validator.then(function(formatted) {
                $scope.validating = false;
                $scope.respMessage(formatted);
            }, function(error) {
                $scope.validating = false;
                $scope.error = error;
            });
        }
    };
    $scope.resize = function() {};
    $scope.validateMessage = function() {
        $scope.rLoading = true;
        $scope.rError = null;
        if (Connectivity.testCase != null && Connectivity.response.getContent() != "") {
            var validator = new ConnectivityValidator().validate($scope.response.message.content, Connectivity.testCase.id, "resp", Connectivity.request.getContent());
            validator.then(function(result) {
                $scope.rLoading = false;
                $scope.setValidationResult(result);
            }, function(error) {
                $scope.rLoading = false;
                $scope.rError = error;
                $scope.setValidationResult({});
            });
        } else {
            $scope.setValidationResult({});
            $scope.rLoading = false;
            $scope.rError = null;
        }
    };
    $scope.setValidationResult = function(mvResult) {
        $scope.response.validationResult.init(mvResult);
        $scope.validationResult = $scope.response.validationResult;
        $scope.errors = $scope.validationResult.errors;
        $scope.affirmatives = $scope.validationResult.affirmatives;
        $scope.alerts = $scope.validationResult.alerts;
        $scope.ignores = $scope.validationResult.ignores;
        $scope.warnings = $scope.validationResult.warnings;
    };
    $scope.select = function(element) {
        if (element.line != -1) {
            Connectivity.response.cursor.setLine(element.line);
        }
    };
} ]);

angular.module("connectivity").controller("ConnectivityRespReportCtrl", [ "$scope", "$sce", "$http", "SoapValidationReportGenerator", "SoapValidationReportDownloader", "Connectivity", function($scope, $sce, $http, SoapValidationReportGenerator, SoapValidationReportDownloader, Connectivity) {
    $scope.connectivityRespHtmlReport = null;
    $scope.error = null;
    $scope.loading = false;
    $scope.testCase = Connectivity.testCase;
    $scope.init = function() {
        $scope.$watch(function() {
            return Connectivity.response.validationResult.xml;
        }, function(xmlReport) {
            if (xmlReport != null && xmlReport != "") {
                $scope.loading = true;
                var promise = new SoapValidationReportGenerator(xmlReport, "html");
                promise.then(function(json) {
                    $scope.connectivityRespHtmlReport = $sce.trustAsHtml(json.htmlReport);
                    $scope.loading = false;
                    $scope.error = null;
                }, function(error) {
                    $scope.error = error;
                    $scope.loading = false;
                    $scope.connectivityRespHtmlReport = null;
                });
            } else {
                $scope.loading = false;
                $scope.connectivityRespHtmlReport = null;
                $scope.error = null;
            }
        }, true);
    };
    $scope.downloadAs = function(format) {
        SoapValidationReportDownloader.downloadAs(Connectivity.response.validationResult.xml, format);
    };
} ]);

angular.module("connectivity").controller("ConnectivityReceiverCtrl", function($scope, $sce, $http, Connectivity, $rootScope, $modalInstance, testCase, logger, TestExecutionClock, message, SOAPConnectivityTransport, $timeout) {
    $scope.testCase = testCase;
    $scope.logger = logger;
    $scope.message = message;
    $scope.sent = null;
    $scope.received = null;
    $scope.connecting = false;
    $scope.error = null;
    $scope.counterMax = 120;
    $scope.counter = 0;
    $scope.listenerReady = false;
    $scope.warning = null;
    SOAPConnectivityTransport.init();
    $scope.transport = SOAPConnectivityTransport;
    $scope.config = SOAPConnectivityTransport.configs[SOAPConnectivityTransport.protocol].data.sutInitiator;
    $scope.domain = $rootScope.domain.domain;
    $scope.protocol = SOAPConnectivityTransport.protocol;
    $scope.log = function(log) {
        $scope.logger.log(log);
    };
    $scope.close = function() {
        $modalInstance.close({
            sent: $scope.sent,
            received: $scope.received
        });
    };
    $scope.cancel = function() {
        $modalInstance.dismiss("cancel");
    };
    $scope.hasRequestContent = function() {
        return $scope.message != null && $scope.message != "";
    };
    $scope.stopListener = function() {
        $scope.connecting = false;
        $scope.counter = $scope.counterMax;
        TestExecutionClock.stop();
        $scope.log("Stopping listener. Please wait....");
        $scope.transport.stopListener($scope.testCase.id, $scope.domain, $scope.protocol).then(function(response) {
            $scope.log("Listener stopped.");
        }, function(error) {
            $scope.log("Failed to stop the listener. Error is " + error);
            $scope.error = "Failed to stop the listener. Error is " + error;
        });
    };
    $scope.startListener = function() {
        $scope.logger.clear();
        $scope.counter = 0;
        $scope.connecting = true;
        $scope.received = "";
        $scope.sent = "";
        $scope.error = null;
        $scope.warning = null;
        $scope.log("Starting listener. Please wait...");
        var rspMessageId = 0;
        $scope.transport.startListener($scope.testCase.id, rspMessageId, $scope.domain, $scope.protocol).then(function(started) {
            if (started) {
                $scope.log("Listener started.");
                var execute = function() {
                    ++$scope.counter;
                    $scope.log("Waiting for incoming message....Elapsed time(second):" + $scope.counter + "s");
                    $scope.transport.searchTransaction($scope.testCase.id, SOAPConnectivityTransport.configs[$scope.protocol].data.sutInitiator, rspMessageId).then(function(transaction) {
                        if (transaction != null) {
                            var incoming = transaction.incoming;
                            var outbound = transaction.outgoing;
                            $scope.log("Incoming Message <--------------------------------------");
                            if (incoming != null && incoming != "") {
                                $scope.log(incoming);
                                $scope.received = incoming;
                            } else {
                                $scope.log("Incoming message received is empty");
                            }
                            $scope.log("Outgoing Message:    -------------------------------------->");
                            if (outbound != null && outbound != "") {
                                $scope.log(outbound);
                                $scope.sent = outbound;
                            } else {
                                $scope.log("Outbound message sent is empty");
                            }
                            $scope.stopListener();
                        } else if ($scope.counter >= $scope.counterMax) {
                            $scope.warning = "We did not receive any incoming message after 2 min. <p>Possible cause (1): You are using wrong credentials. Please check the credentials in your outbound SOAP Envelope against those created for your system.</p>  <p>Possible cause (2):The SOAP endpoint address may be incorrect.   Verify that you are using the correct SOAP endpoint address that is displayed by the tool.</p>" + "<p>Possible cause (3):The HTTP header field Content-Type  may not be set correctly for use with SOAP 1.2.   SOAP 1.2 requires application/soap+xml, and SOAP 1.2 requires text/xml.  The NIST Tool follows SOAP 1.2, which is required by section 2 of the 'CDC Transport Layer Protocol Recommendation V1.1' (http://www.cdc.gov/vaccines/programs/iis/technical-guidance/SOAP/downloads/transport-specification.pdf)</p>";
                            $scope.log("We did not receive any incoming message after 30s");
                            $scope.stopListener();
                        }
                    }, function(error) {
                        $scope.error = error;
                        $scope.log("Error: " + error);
                        $scope.received = "";
                        $scope.sent = "";
                        $scope.stopListener();
                    });
                };
                TestExecutionClock.start(execute);
            } else {
                $scope.error = "Failed to start the listener. Please contact the administrator for any question";
                $scope.log($scope.error);
                $scope.log("Transaction aborted");
                $scope.connecting = false;
                $scope.counter = $scope.counterMax;
                TestExecutionClock.stop();
            }
        }, function(error) {
            $scope.error = "Failed to start the listener. Error is " + error;
            $scope.log($scope.error);
            $scope.received = "";
            $scope.sent = "";
            $scope.connecting = false;
            $scope.counter = $scope.counterMax;
            TestExecutionClock.stop();
        });
    };
});

angular.module("domains").controller("DomainsCtrl", function($scope, $rootScope, $http, $filter, $cookies, $sce, $timeout, userInfoService, StorageService, DomainsManager, $modal, $location, $window) {
    $scope.status = {
        userDoc: true
    };
    $scope.selectedDomain = {
        id: null
    };
    $scope.userDomains = null;
    $scope.userDomain = null;
    $scope.alertMessage = null;
    $scope.loading = false;
    $scope.loadingDomain = false;
    $scope.loadingAction = false;
    $scope.loadingDomains = false;
    $scope.domainsErrors = null;
    $scope.hasDomainAccess = function(domain) {
        return userInfoService.isAuthenticated() && (userInfoService.isAdmin() || domain != null && domain.owner === userInfoService.getUsername());
    };
    $scope.initDomain = function() {
        $scope.loadDomains();
    };
    $scope.viewDomain = function(domain, waitingTime) {
        waitingTime = waitingTime == undefined ? 3e3 : waitingTime;
        $scope.loadingDomain = true;
        $scope.errorDomain = null;
        $scope.originalUserDomain = null;
        $scope.userDomain = null;
        $timeout(function() {
            if ($rootScope.isDomainsManagementSupported() && userInfoService.isAuthenticated()) {
                if (domain != null && $scope.hasDomainAccess(domain)) {
                    $scope.userDomain = null;
                    $scope.errorDomain = null;
                    $scope.userDomain = angular.copy(domain);
                    $scope.originalUserDomain = angular.copy($scope.userDomain);
                    $scope.loadingDomain = false;
                } else {
                    $scope.loadingDomain = false;
                }
            } else {
                $scope.loadingDomain = false;
            }
        }, waitingTime);
    };
    $scope.openDomain = function(domain) {
        var url = $window.location.protocol + "//" + $window.location.host + $window.location.pathname + "#/home?d=" + domain.domain;
        $window.open(url, "open_toolscope_page", "_blank");
    };
    $scope.displayScope = function(scope) {
        return scope === "GLOBAL" ? "Public" : "USER" ? "Private" : "Unknown";
    };
    $scope.loadDomains = function() {
        $scope.userDomains = null;
        $scope.loadingDomains = true;
        $scope.domainsError = null;
        DomainsManager.findByUserAndRole().then(function(domains) {
            $scope.userDomains = domains;
            $scope.userDomains = $filter("orderBy")($scope.userDomains, "position");
            $scope.loadingDomains = false;
            if ($scope.userDomains != null && $scope.userDomains.length > 0) {
                var dom = null;
                if ($scope.userDomains.length === 1) {
                    dom = $scope.userDomains[0];
                } else {
                    for (var i = 0; i < $scope.userDomains.length; i++) {
                        if ($scope.userDomains[i].domain === $rootScope.domain.domain) {
                            dom = $scope.userDomains[i];
                            break;
                        }
                    }
                }
                if (dom != null) {
                    $scope.viewDomain(dom);
                }
            }
        }, function(error) {
            $scope.loadingDomains = false;
            $scope.domainsError = error;
        });
    };
    $scope.closeAlert = function() {
        $scope.alertMessage = null;
    };
    $scope.setErrorAlert = function(message) {
        $scope.alertMessage = {};
        $scope.alertMessage.type = "danger";
        $scope.alertMessage.message = message;
    };
    $scope.setInfoAlert = function(message) {
        $scope.alertMessage = {};
        $scope.alertMessage.type = "info";
        $scope.alertMessage.message = message;
    };
    $scope.setSuccessAlert = function(message) {
        $scope.alertMessage = {};
        $scope.alertMessage.type = "success";
        $scope.alertMessage.message = message;
    };
    $scope.deleteDomain = function() {
        var modalInstance = $modal.open({
            templateUrl: "views/domains/confirm-delete.html",
            controller: "ConfirmDialogCtrl",
            size: "md",
            backdrop: "static",
            keyboard: false
        });
        modalInstance.result.then(function(result) {
            if (result) {
                DomainsManager.delete($scope.userDomain.id).then(function(response) {
                    $scope.userDomain = null;
                    $scope.originalUserDomain = null;
                    $scope.loadingAction = false;
                    $scope.setSuccessAlert("Tool scope deleted successfully!");
                    $rootScope.domain = null;
                    $rootScope.reloadPage();
                }, function(error) {
                    $scope.loadingAction = false;
                    $scope.setErrorAlert(error.text);
                });
            }
        });
    };
    $scope.saveDomain = function() {
        $scope.loadingAction = true;
        DomainsManager.save($scope.userDomain).then(function(result) {
            $scope.userDomain = result;
            $scope.originalUserDomain = angular.copy(result);
            $scope.loadingAction = false;
            $scope.setSuccessAlert("Tool scope saved successfully!");
            $rootScope.domain = angular.copy(result);
            $rootScope.reloadPage();
        }, function(error) {
            $scope.loadingAction = false;
            $scope.setErrorAlert(error.text);
        });
    };
    $scope.resetDomain = function() {
        var modalInstance = $modal.open({
            templateUrl: "views/domains/confirm-reset.html",
            controller: "ConfirmDialogCtrl",
            size: "md",
            backdrop: "static",
            keyboard: false
        });
        modalInstance.result.then(function(result) {
            if (result) {
                $scope.userDomain = $scope.originalUserDomain;
                $scope.originalUserDomain = angular.copy($scope.userDomain);
                $scope.setSuccessAlert("Tool scope reset successfully!");
            }
        });
    };
    $scope.saveAndPublishDomain = function() {
        if ($rootScope.canPublish()) {
            var modalInstance = $modal.open({
                templateUrl: "views/domains/confirm-publish.html",
                controller: "ConfirmDialogCtrl",
                size: "md",
                backdrop: "static",
                keyboard: false
            });
            modalInstance.result.then(function(result) {
                if (result) {
                    $scope.loadingAction = true;
                    DomainsManager.saveAndPublish($scope.userDomain).then(function(result) {
                        $scope.userDomain = result;
                        $scope.originalUserDomain = angular.copy(result);
                        $scope.loadingAction = false;
                        $scope.setSuccessAlert("Tool scope " + $scope.userDomain.name + " is now public. Please note only public test plans will be visible to users!");
                        if ($scope.userDomain.domain === $rootScope.domain.domain) {
                            $rootScope.domain = angular.copy(result);
                            $rootScope.reloadPage();
                        }
                    }, function(error) {
                        $scope.loadingAction = false;
                        $scope.setErrorAlert(error.text);
                    });
                }
            });
        }
    };
    $scope.publishDomain = function(dom) {
        if ($rootScope.canPublish()) {
            var modalInstance = $modal.open({
                templateUrl: "views/domains/confirm-publish.html",
                controller: "ConfirmDialogCtrl",
                size: "md",
                backdrop: "static",
                keyboard: false
            });
            modalInstance.result.then(function(result) {
                if (result) {
                    DomainsManager.publish(dom.id).then(function(result) {
                        $scope.setSuccessAlert("Tool scope " + dom.name + " is now public. Please note only public test plans will be visible to users!");
                        if (dom.domain === $rootScope.domain.domain) {
                            $rootScope.domain = angular.copy(result);
                            $rootScope.reloadPage();
                        }
                    }, function(error) {
                        $scope.setErrorAlert(error.text);
                    });
                }
            });
        }
    };
    $scope.unpublishDomain = function(dom) {
        if ($rootScope.canPublish()) {
            var modalInstance = $modal.open({
                templateUrl: "views/domains/confirm-unpublish.html",
                controller: "ConfirmDialogCtrl",
                size: "md",
                backdrop: "static",
                keyboard: false
            });
            modalInstance.result.then(function(result) {
                if (result) {
                    DomainsManager.unpublish(dom.id).then(function(result) {
                        $scope.setSuccessAlert("Tool scope " + dom.name + " is now private!");
                        if (dom.domain === $rootScope.domain.domain) {
                            $rootScope.domain = angular.copy(result);
                            $rootScope.reloadPage();
                        }
                    }, function(error) {
                        $scope.setErrorAlert(error.text);
                    });
                }
            });
        }
    };
    $scope.saveAndUnpublishDomain = function() {
        if ($rootScope.canPublish()) {
            var modalInstance = $modal.open({
                templateUrl: "views/domains/confirm-unpublish.html",
                controller: "ConfirmDialogCtrl",
                size: "md",
                backdrop: "static",
                keyboard: false
            });
            modalInstance.result.then(function(result) {
                if (result) {
                    $scope.loadingAction = true;
                    DomainsManager.saveAndUnpublish($scope.userDomain).then(function(result) {
                        $scope.userDomain = result;
                        $scope.originalUserDomain = angular.copy(result);
                        $scope.loadingAction = false;
                        $scope.setSuccessAlert("Tool scope " + $scope.userDomain.name + " is now private. Please note only you can access the tool scope!");
                        if ($scope.userDomain.domain === $rootScope.domain.domain) {
                            $rootScope.domain = angular.copy(result);
                            $rootScope.reloadPage();
                        }
                    }, function(error) {
                        $scope.loadingAction = false;
                        $scope.setErrorAlert(error.text);
                    });
                }
            });
        }
    };
    $scope.loadDefaultHomeContent = function() {
        DomainsManager.getDefaultHomeContent().then(function(result) {
            $scope.userDomain.homeContent = result;
        }, function(error) {
            $scope.loadingAction = false;
            $scope.setErrorAlert(error);
        });
    };
    $scope.loadDefaultProfileInfo = function() {
        DomainsManager.getDefaultProfileInfo().then(function(result) {
            $scope.userDomain.profileInfo = result;
        }, function(error) {
            $scope.setErrorAlert(error);
        });
    };
    $scope.loadDefaultValueSetCopyright = function() {
        DomainsManager.getDefaultValueSetCopyright().then(function(result) {
            $scope.userDomain.valueSetCopyright = result;
        }, function(error) {
            $scope.setErrorAlert(error);
        });
    };
    $scope.loadDefaultMessageContent = function() {
        DomainsManager.getDefaultMessageContent().then(function(result) {
            $scope.userDomain.messageContent = result;
        }, function(error) {
            $scope.setErrorAlert(error);
        });
    };
    $scope.loadDefaultValidationResultInfo = function() {
        DomainsManager.getDefaultValidationResultInfo().then(function(result) {
            $scope.userDomain.validationResultInfo = result;
        }, function(error) {
            $scope.setErrorAlert(error);
        });
    };
});

angular.module("domains").controller("CreateDomainCtrl", function($scope, $modalInstance, scope, DomainsManager) {
    $scope.newDomain = {
        name: null,
        domain: null,
        homeTitle: null
    };
    $scope.error = null;
    $scope.loading = false;
    $scope.submit = function() {
        if ($scope.newDomain.name != null && $scope.newDomain.name != "" && $scope.newDomain.homeTitle != null && $scope.newDomain.homeTitle != "" && $scope.newDomain.name.toLowerCase() != "app") {
            $scope.error = null;
            $scope.loading = true;
            $scope.newDomain.domain = $scope.newDomain.name.replace(/\s+/g, "-").toLowerCase();
            DomainsManager.create($scope.newDomain.name, $scope.newDomain.domain, scope, $scope.newDomain.homeTitle).then(function(result) {
                $scope.loading = false;
                $modalInstance.close(result);
            }, function(error) {
                $scope.loading = false;
                $scope.error = error.text;
            });
        }
    };
    $scope.cancel = function() {
        $modalInstance.dismiss("cancel");
    };
});

angular.module("logs").directive("stLogDateRange", [ "$timeout", function($timeout) {
    return {
        restrict: "E",
        require: "^stTable",
        scope: {
            before: "=",
            after: "="
        },
        templateUrl: "stLogDateRange.html",
        link: function(scope, element, attr, table) {
            var inputs = element.find("input");
            var inputBefore = angular.element(inputs[0]);
            var inputAfter = angular.element(inputs[1]);
            var predicateName = attr.predicate;
            [ inputBefore, inputAfter ].forEach(function(input) {
                input.bind("blur", function() {
                    var query = {};
                    if (!scope.isBeforeOpen && !scope.isAfterOpen) {
                        if (scope.before) {
                            query.before = scope.before;
                        }
                        if (scope.after) {
                            query.after = scope.after;
                        }
                        scope.$apply(function() {
                            table.search(query, predicateName);
                        });
                    }
                });
            });
            function open(before) {
                return function($event) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    if (before) {
                        scope.isBeforeOpen = true;
                    } else {
                        scope.isAfterOpen = true;
                    }
                };
            }
            scope.openBefore = open(true);
            scope.openAfter = open();
        }
    };
} ]).directive("stNumberRange", [ "$timeout", function($timeout) {
    return {
        restrict: "E",
        require: "^stTable",
        scope: {
            lower: "=",
            higher: "="
        },
        templateUrl: "stNumberRange.html",
        link: function(scope, element, attr, table) {
            var inputs = element.find("input");
            var inputLower = angular.element(inputs[0]);
            var inputHigher = angular.element(inputs[1]);
            var predicateName = attr.predicate;
            [ inputLower, inputHigher ].forEach(function(input, index) {
                input.bind("blur", function() {
                    var query = {};
                    if (scope.lower) {
                        query.lower = scope.lower;
                    }
                    if (scope.higher) {
                        query.higher = scope.higher;
                    }
                    scope.$apply(function() {
                        table.search(query, predicateName);
                    });
                });
            });
        }
    };
} ]).filter("logCustomFilter", [ "$filter", function($filter) {
    var filterFilter = $filter("filter");
    var standardComparator = function standardComparator(obj, text) {
        text = ("" + text).toLowerCase();
        return ("" + obj).toLowerCase().indexOf(text) > -1;
    };
    return function customFilter(array, expression) {
        function customComparator(actual, expected) {
            var isBeforeActivated = expected.before;
            var isAfterActivated = expected.after;
            var isLower = expected.lower;
            var isHigher = expected.higher;
            var higherLimit;
            var lowerLimit;
            var itemDate;
            var queryDate;
            if (angular.isObject(expected)) {
                if (expected.before || expected.after) {
                    try {
                        if (isBeforeActivated) {
                            higherLimit = expected.before;
                            itemDate = new Date(actual);
                            queryDate = new Date(higherLimit);
                            if (itemDate > queryDate) {
                                return false;
                            }
                        }
                        if (isAfterActivated) {
                            lowerLimit = expected.after;
                            itemDate = new Date(actual);
                            queryDate = new Date(lowerLimit);
                            if (itemDate < queryDate) {
                                return false;
                            }
                        }
                        return true;
                    } catch (e) {
                        return false;
                    }
                } else if (isLower || isHigher) {
                    if (isLower) {
                        higherLimit = expected.lower;
                        if (actual > higherLimit) {
                            return false;
                        }
                    }
                    if (isHigher) {
                        lowerLimit = expected.higher;
                        if (actual < lowerLimit) {
                            return false;
                        }
                    }
                    return true;
                }
                return true;
            }
            return standardComparator(actual, expected);
        }
        var output = filterFilter(array, expression, customComparator);
        return output;
    };
} ]);

angular.module("hit-settings").controller("SettingsCtrl", [ "$scope", "$modalInstance", "StorageService", "$rootScope", "SettingsService", "userInfoService", "Notification", function($scope, $modalInstance, StorageService, $rootScope, SettingsService, userInfoService, Notification) {
    $scope.options = angular.copy(SettingsService.options);
    SettingsService.getValidationClassifications($rootScope.domain).then(function(classifications) {
        $scope.domainClassifications = classifications;
    });
    $scope.onCheckAllValidationOptions = function($event) {
        var checkbox = $event.target;
        if (checkbox.checked) {
            $scope.selectAllValidationOptions();
        } else {
            $scope.unselectAllValidationOptions();
        }
    };
    $scope.selectAllValidationOptions = function() {
        $scope.options.validation.show.errors = true;
        $scope.options.validation.show.alerts = true;
        $scope.options.validation.show.warnings = true;
        $scope.options.validation.show.affirmatives = true;
        $scope.options.validation.show.informationals = true;
        $scope.options.validation.show.specerrors = true;
    };
    $scope.isAllValidationOptionsChecked = function() {
        return;
        $scope.options.validation.show.errors && $scope.options.validation.show.alerts && $scope.options.validation.show.warnings && $scope.options.validation.show.affirmatives && $scope.options.validation.show.informationals && $scope.options.validation.show.specerrors;
    };
    $scope.unselectAllValidationOptions = function() {
        $scope.options.validation.show.errors = true;
        $scope.options.validation.show.alerts = false;
        $scope.options.validation.show.warnings = false;
        $scope.options.validation.show.affirmatives = false;
        $scope.options.validation.show.informationals = false;
        $scope.options.validation.show.specerrors = false;
    };
    $scope.cancel = function() {
        $modalInstance.dismiss("cancel");
    };
    $scope.isAdmin = function() {
        return userInfoService.isAdmin();
    };
    $rootScope.isDomainOwner = function() {
        return $rootScope.domain != null && $rootScope.domain.owner === userInfoService.getUsername();
    };
    $scope.save = function() {
        SettingsService.set($scope.options);
        if ($scope.isAdmin() || $rootScope.isDomainOwner()) {
            SettingsService.saveValidationClassifications($scope.domainClassifications, $rootScope.domain).then(function(result) {
                Notification.success({
                    message: "Validation parameters save successfully!",
                    templateUrl: "NotificationSuccessTemplate.html",
                    scope: $rootScope,
                    delay: 3e3
                });
            }, function(error) {});
        }
        $modalInstance.close($scope.options);
    };
    $scope.resetClassifications = function() {
        SettingsService.resetClassifications().then(function(classifications) {
            $scope.domainClassifications = classifications;
        });
    };
} ]);