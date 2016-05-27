(function() {
    angular.module('loc8rApp')
        .filter('addHtmlLineBreaks', addHtmlLineBreaks);

    function addHtmlLineBreaks() {
        return function(texc){
            var output = texc.replace(/\n/g, '<br/>');
            return output;
        };
    }
}());
