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
                "           <a data-ng-if=\"menu.menuList\" class=\"dropdown-toggle\" ng-class=\"{'active ': (menu | CPFMenuActive)}\" " +
                "               data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">" +
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
            controller: [function () {}]
        };
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
                "<ul class=\"nav navbar-nav navbar-left\">" +
                "   <li ng-class=\"{true: \"selected2\", false: \"\"}[activeAreaMenuId == menu.menuId]\" ng-repeat=\"menu in menuAreaArray\">" +
                "       <a href=\"\" ng-click=\"changeMenu(menu)\">{{translateKey ? (\"menu.m_\" + menu[translateKey] | CPFMenuTitle) : menu.menuTitle}}</a>" +
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
                        $cookies.putObject("menuInfo", {"bigMenuId": menu.menuId}, {"expires": expireDate});
                    };
                }]
        };
    });
    menu.directive("toggleSubmenu", function(){
        return {
            restrict: "A",
            link: function(scope, element) {
                $(element).addClass("menu");
                element.click(function(){
                    var flag = element.parent().hasClass("toggled");
                    element.parent().parent().children().each(function () {
                        $(this).removeClass("toggled");
                        $(this).children("ul").css("display", "none");
                    });
                    if (!flag) {
                        element.next().slideToggle(200);
                        element.parent().toggleClass("toggled");
                    }
                });
            }
        };
    });
    // menu.directive("dropdownToggle", function(){
    //     return {
    //         restrict: "A",
    //         link: function(scope, element) {
    //             $(element).addClass("dropdown-toggle");
    //             $(element).dropdown();
    //         }
    //     };
    // });
    menu.provider("$CPFMenu", [function CPFMenuProvider() {
        this.menuAreaArrayFlag = true;
        this.userInfoKey = "userInfo";
        this.cookiesDays = 30;
        this.setConfig = function (config) {
            angular.extend(this, config);
        };
        this.initMenu = function (rootScope, platformInfoList, defaultPlatCode, cacheMenuInfo) {
            // 获取是否进行了平台选择，如果有，则默认先进入此平台。
            var menuList = [], tempMenuTree = [];
            if (defaultPlatCode) {
                menuList = this.getPlatformMenuList(platformInfoList, defaultPlatCode);
            }
            if (menuList.length > 0) {
                tempMenuTree = this.buildMenuTree(menuList, 0);
            }
            // 判断是否有顶部的权限列表
            if (this.menuAreaArrayFlag) { // 有顶部列表，则先获取顶部列表对象
                rootScope.menuAreaArray = tempMenuTree;
                rootScope.menuArray = this.getDefaultMenu(rootScope.menuAreaArray, cacheMenuInfo);
            } else {
                rootScope.menuArray = tempMenuTree;
            }
        };
        this.getPlatformMenuList = function(platformInfoList, platCode) {
            for (var i = 0; i < platformInfoList.length; i++) {
                if (platformInfoList[i].platCode == platCode) { return platformInfoList[i].menuList; }
            }
            return [];
        };
        this.buildMenuTree = function(menuList, parentMenuId) {
            var retList = [];
            if (menuList == undefined || menuList.length < 1) {return retList;}
            for (var i = 0; i < menuList.length; i ++) {
                var menu = menuList[i];
                if (menu.parentMenuId == parentMenuId) {
                    menu.menuList = this.buildMenuTree(menuList, menu.menuId);
                    retList.push(menu);
                }
            }
            return retList.length < 1 ? undefined : retList;
        };
        this.getDefaultMenu = function(menuAreaArray, cacheMenuInfo) {
            if (!menuAreaArray) {return;}
            if (!cacheMenuInfo || cacheMenuInfo.bigMenuId == undefined) {
                cacheMenuInfo = {bigMenuId: menuAreaArray[0].menuId};
            }
            var menuList = [];
            for (var i = 0; i < menuAreaArray.length; i++) {
                if (menuAreaArray[i].menuId == cacheMenuInfo.bigMenuId) {
                    menuList = menuAreaArray[i].menuList;
                    break;
                }
            }
            return menuList;
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
    menu.filter("CPFMenuActive",["$state",function($state){
        var fun = function(menu){
            if (menu.href != "" && $state.includes(menu.href)) {return true;}
            if (menu.showFlag != undefined && menu.showFlag.length > 1 && $state.current.name.indexOf(menu.showFlag) == 0) {return true;}
            return false;
        };
        fun.$stateful = true;
        return fun;
    }]);
})(angular);