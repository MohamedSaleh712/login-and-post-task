const urls = {
    users: "https://login-and-post-f44e1-default-rtdb.firebaseio.com/users.json"
}

angular.module('login', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/login', {
            templateUrl: '../views/login.html',
            controller: 'loginCtrl',
        });
    }])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/post', {
            templateUrl: '../views/post.html',
            controller: 'postCtrl',
        });
    }])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/register', {
            templateUrl: '../views/register.html',
            controller: 'registerCtrl',
        });
    }])

    .service('loginService', ['$http', function ($http) {
        let vm = this;
        vm.login = function (obj) {
            return $http.get(urls.users).then(function (result) {
                if (result && result.data) {
                    const { data } = result;
                    for (let [key, user] of Object.entries(data)) {
                        if (obj.email == user.email && obj.password == user.password) {
                            localStorage.setItem("user", JSON.stringify(user));
                            localStorage.setItem("key", key);
                            return vm.userinfo = { key, user };
                        }
                    }
                }
                return false;
            });
        };

    }])

    .service('postService', ['$http', function ($http) {
        let vm = this;

        vm.post = function (posts, key) {
            vm.url = urls.users.slice(0, -5) + "/" + key + "/posts" + ".json";
            return $http.put(vm.url, posts).then(function (result) {
                return result.data;
            });
        };
    }])

    .controller('loginCtrl', ['$scope', 'loginService', '$location', function ($scope, loginService, $location) {
        $scope.error = {
            path: "",
            msg: ""
        };

        $scope.user = {
            email: "",
            password: "",
        }

        $scope.logIn = function () {
            if (valdiateUser()) {
                loginService.login($scope.user).then(function (result) {
                    if((!result)){
                        $scope.showlLoginError=true;
                        return $scope.loginError="username or password is invalid";
                    }
                    $location.path('/post');
                })
            }
        }

        function valdiateUser() {
            const { email, password } = $scope.user;
            if (!email) {
                $scope.error = {
                    path: "email",
                    msg: "email is required!"
                };

                return false;
            }

            if (email) {
                const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if (!re.test(String(email).toLowerCase())) {
                    $scope.error = {
                        path: "email",
                        msg: "invalid email!"
                    };
                    return false;
                }
            }

            if (!password) {
                $scope.error = {
                    path: "password",
                    msg: "password is required!"
                };
                return false;
            }
            return true;
        }
    }])

    .controller('postCtrl', ['$scope', 'postService', 'loginService', function ($scope, postService, loginService) {
        const user = JSON.parse(localStorage.getItem("user"));
        const key = localStorage.getItem("key");
        $scope.username = user.username;
        $scope.email = user.email;
        $scope.password = user.password;
        $scope.posts = user.posts;

        //add post to the user
        $scope.addPost = function () {
            if (!$scope.newPost) {
                $scope.postError = "post is empty!!!";
                return $scope.boolPost = true;
            } else {
                $scope.boolPost = false;
            }

            if (toString.call($scope.posts) != '[object Array]') {
                $scope.posts = Object.values($scope.posts)
                $scope.posts.unshift($scope.newPost);
            }
            else {
                $scope.posts.unshift($scope.newPost);
            }
            localStorage.setItem("user", JSON.stringify(user));
            sendPostToDB($scope.posts, key);
            $scope.newPost = "";
        }
        function sendPostToDB(posts, key) {
            postService.post(posts, key).then(function (result) {
                // return result;
            })
        };

        $scope.deletePost = function (post) {
            let removePost = $scope.posts.indexOf(post);
            $scope.posts.splice(removePost, 1);
            localStorage.setItem("user", JSON.stringify(user));
            sendPostToDB($scope.posts, key);
        };
    }])