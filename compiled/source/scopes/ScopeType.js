// TODO make a static member of the Scope class
var ScopeType;
(function (ScopeType) {
    ScopeType[ScopeType["GLOBAL"] = 0] = "GLOBAL";
    ScopeType[ScopeType["LAYER"] = 1] = "LAYER";
    ScopeType[ScopeType["CLASS"] = 2] = "CLASS";
})(ScopeType || (ScopeType = {}));
module.exports = ScopeType;
//# sourceMappingURL=ScopeType.js.map