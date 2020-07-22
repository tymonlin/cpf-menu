(function (angular) {
    var menu = angular.module("module.cloudpayfull.menu", ["ngCookies"]);
    menu.directive("cpfMenu", function () {
        return {
            restrict: "EA",
            scope: {
                menuArray: "=",
                translateKey: "@",
                sidebarType: "@",
                getUserInfo: "&"
            },
            template:
                "<div>" +
                "   <ul ng-show=\"sidebarType != 'miniBar'\" class=\"nav nav-default\">" +
                "       <li class=\"dropdown\" data-ng-repeat=\"menu in menuArray\"" +
                "           data-ng-class=\"{'active': (menu | CPFMenuActive), 'toggled': (menu | CPFMenuActive)}\">" +
                "           <a data-ng-if=\"!menu.menuList\"" +
                "               ng-class=\"{'active ': (menu | CPFMenuActive)}\"" +
                "               data-ui-sref=\"{{menu.href}}\"><i class=\"fa {{menu.icon}}\"></i> <label class='menu-title'>{{translateKey ? (('menu.m_' + menu[translateKey]) | CPFMenuTitle) : menu.menuTitle}}</label> " +
                "           </a>" +
                "           <a data-ng-if=\"menu.menuList\" "+
                "               ng-class=\"{'active':(menu | CPFMenuActive)}\" toggle-submenu>" +
                "               <i class=\"fa {{menu.icon}}\"></i> <label class='menu-title'>{{translateKey ? (('menu.m_' + menu[translateKey]) | CPFMenuTitle) : menu.menuTitle}}</label>" +
                "           </a>"+
                "           <ul data-ng-if=\"menu.menuList != null && menu.menuList.length > 0\" class=\"nav\">" +
                "               <li data-ng-repeat=\"sonMenu in menu.menuList\"> " +
                "                   <a data-ui-sref=\"{{sonMenu.href}}\" data-ng-click=\"sidebarStat($event)\" ng-class=\"{'active': (sonMenu | CPFMenuActive)}\"> <label class='menu-title'>{{ translateKey ? (('menu.m_' + sonMenu[translateKey]) | CPFMenuTitle) : sonMenu.menuTitle}}</label> </a>" +
                "               </li>"+
                "           </ul>"+
                "       </li>" +
                "   </ul>" +
                "   <ul ng-show=\"sidebarType == 'miniBar'\" class=\"nav mini-bar\">" +
                "       <li data-ng-repeat=\"menu in menuArray\" data-ng-class=\"{'active': (menu | CPFMenuActive)}\" title=\"{{ translateKey ? (('menu.m_' + menu[translateKey]) | CPFMenuTitle) : menu.menuTitle}}\">" +
                "           <a data-ng-if=\"!menu.menuList\" ng-class=\"{'active ': (menu | CPFMenuActive)}\" data-ui-sref=\"{{menu.href}}\">" +
                "               <i class=\"fa {{menu.icon}}\"></i>" +
                "           </a>" +
                "           <a data-ng-if=\"menu.menuList\" ng-class=\"{'active ': (menu | CPFMenuActive)}\" " +
                "               data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\" dropdown-toggle>" +
                "               <i class=\"fa {{menu.icon}}\"></i>" +
                "           </a>" +
                "           <ul class=\"dropdown-menu nav\">" +
                "               <li data-ng-repeat=\"sonMenu in menu.menuList\" data-ng-class=\"{'active': (menu | CPFMenuActive)}\"> " +
                "                   <a data-ui-sref=\"{{sonMenu.href}}\" data-ng-click=\"sidebarStat($event)\" ng-class=\"{'active': (sonMenu | CPFMenuActive)}\"> " +
                "                       <label class='menu-title'>{{ translateKey ? (('menu.m_' + sonMenu[translateKey]) | CPFMenuTitle) : sonMenu.menuTitle}}</label>" +
                "                   </a>" +
                "               </li>"+
                "           </ul>"+
                "       </li>" +
                "   </ul>" +
                "</div>",
            replace: true,
            controller: ["$scope", "$rootScope", "$cookies", "$CPFMenu",
                function ($scope, $rootScope, $cookies, $CPFMenu) {
                    if (!$CPFMenu.menuAreaArrayFlag) {
                        var cookiesUserInfo = $cookies.getObject($CPFMenu.userInfoKey);
                        if (cookiesUserInfo) {
                            var listener = {
                                success: function (userInfo) {
                                    if (userInfo.platformInfoList.length < 1) return;
                                    var menuList = $CPFMenu.getMenuList(userInfo, userInfo.platformInfoList[0].platCode);
                                    var menuAreaArray = $CPFMenu.initMenuList(menuList, 0);
                                    var defaultMenu = $CPFMenu.getDefaultMenu(menuAreaArray, $cookies.getObject("menuInfo"));
                                    $rootScope.menuArray = defaultMenu.menuList;
                                }
                            };
                            $scope.getUserInfo({"listener": listener});
                        }
                    }
                }]
        }
    });
    menu.directive("cpfAreaMenu", function () {
        return {
            restrict: "EA",
            scope: {
                menuAreaArray: "=",
                translateKey: "@",
                getUserInfo: "&"
            },
            template:
                "<ul class=\"pull-left\">" +
                "   <li ng-class=\"{true: 'selected2', false: ''}[activeAreaMenuId == menu.menuId]\" ng-repeat=\"menu in menuAreaArray\">" +
                "       <a href='' ng-click='changeMenu(menu)'>{{translateKey ? ('menu.m_' + menu[translateKey] | CPFMenuTitle) : menu.menuTitle}}</a>" +
                "   </li>" +
                "</ul>",
            replace: true,
            controller: ["$scope", "$rootScope", "$cookies", "$CPFMenu",
                function ($scope, $rootScope, $cookies, $CPFMenu) {
                    $scope.changeMenu = function(menu) {
                        $rootScope.menuArray = menu.menuList;
                        $scope.activeAreaMenuId = menu.menuId;
                        var expireDate = new Date();
                        expireDate.setDate(expireDate.getDate() + $CPFMenu.cookiesDays);//设置cookie保存30天
                        $cookies.putObject("menuInfo", {"bigMenuId": menu.menuId}, {'expires': expireDate});
                    };
                    if ($CPFMenu.menuAreaArrayFlag) {
                        var userCookies = $cookies.getObject($CPFMenu.userInfoKey);
                        if (userCookies) {
                            var listener = {
                                success: function (userInfo) {
                                    if (userInfo.platformInfoList.length < 1) return;
                                    var menuList = $CPFMenu.getMenuList(userInfo, userInfo.platformInfoList[0].platCode);
                                    $rootScope.menuAreaArray = $CPFMenu.initMenuList(menuList, 0);
                                    var defaultMenu = $CPFMenu.getDefaultMenu($rootScope.menuAreaArray, $cookies.getObject("menuInfo"));
                                    $scope.changeMenu(defaultMenu);
                                }
                            };
                            $scope.getUserInfo({"listener": listener});
                        }
                    }
                }]
        }
    });
    menu.directive('toggleSubmenu', function(){
        return {
            restrict: 'A',
            link: function(scope, element) {
                $(element).addClass("menu");
                element.click(function(){
                    var flag = element.parent().hasClass("toggled");
                    element.parent().parent().children().each(function (i) {
                        $(this).removeClass("toggled");
                        $(this).children("ul").css("display", "none");
                    });
                    if (!flag) {
                        element.next().slideToggle(200);
                        element.parent().toggleClass('toggled');
                    }
                });
            }
        }
    });
    menu.directive('dropdownToggle', function(){
        return {
            restrict: 'A',
            link: function(scope, element) {
                $(element).addClass("dropdown-toggle");
                $(element).dropdown();
            }
        }
    });
    menu.provider("$CPFMenu", [function CPFMenuProvider() {
        this.menuAreaArrayFlag = true;
        this.userInfoKey = "userInfo";
        this.cookiesDays = 30;
        this.setConfig = function (config) {
            angular.extend(this, config);
        }
        this.getMenuList = function(userInfo, platCode) {
            for (var i = 0; i < userInfo.platformInfoList.length; i++) {
                var platformInfo = userInfo.platformInfoList[i];
                if (platformInfo.platCode == platCode) {
                    return platformInfo.menuList;
                }
            }
            return [];
        };
        this.initMenuList = function(menuList, parentMenuId) {
            var retList = [];
            if (menuList == undefined || menuList.length < 1) return retList;
            for (var i = 0; i < menuList.length; i ++) {
                var menu = menuList[i];
                if (menu.parentMenuId == parentMenuId) {
                    menu.menuList = this.initMenuList(menuList, menu.menuId);
                    retList.push(menu);
                }
            }
            return retList.length < 1 ? undefined : retList;
        };
        this.getDefaultMenu = function(menuAreaArray, cacheMenuInfo) {
            if (!menuAreaArray) return ;
            if (cacheMenuInfo == undefined || cacheMenuInfo.bigMenuId == undefined) {
                cacheMenuInfo = {bigMenuId: menuAreaArray[0].menuId}
            }
            var menu = undefined;
            for (var i = 0; i < menuAreaArray.length; i++) {
                if (menuAreaArray[i].menuId == cacheMenuInfo.bigMenuId) {
                    menu = menuAreaArray[i];
                    break;
                }
            }
            return menu;
        };
        this.$get = function () {
            return this;
        };
    }]);
    menu.filter("CPFMenuTitle", ["$injector", function ($injector) {
        var $translate = $injector.has("$translate") ? $injector.get("$translate") : undefined;
        var fun = function (tag) {
            return $translate ? $translate.instant(tag) : tag;
        };
        fun.$stateful = true;
        return fun;
    }]);
    menu.filter('CPFMenuActive',['$state',function($state){
        var fun = function(menu){
            if (menu.href != '' && $state.includes(menu.href)) return true;
            if (menu.showFlag != undefined && menu.showFlag.length > 1 && $state.current.name.indexOf(menu.showFlag) >= 0) return true;
            return false;
        }
        fun.$stateful = true;
        return fun;
    }]);
})(angular);