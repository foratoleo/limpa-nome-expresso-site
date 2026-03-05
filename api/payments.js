"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
var supabase_js_1 = require("@supabase/supabase-js");
function handler(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var authHeader, token, supabaseUrl, supabase, _a, user, authError, _b, access, error, _c, manualAccess, manualError, finalResponse, error_1, errorMessage;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    // Enable CORS
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
                    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
                    if (req.method === 'OPTIONS') {
                        return [2 /*return*/, res.status(200).end()];
                    }
                    if (req.method !== 'GET') {
                        return [2 /*return*/, res.status(405).json({ error: 'Method not allowed' })];
                    }
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 5, , 6]);
                    authHeader = req.headers.authorization;
                    if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer '))) {
                        return [2 /*return*/, res.status(401).json({ error: 'Unauthorized' })];
                    }
                    token = authHeader.replace('Bearer ', '');
                    supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
                    if (!supabaseUrl) {
                        throw new Error('SUPABASE_URL environment variable is not set');
                    }
                    supabase = (0, supabase_js_1.createClient)(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY, {
                        auth: {
                            autoRefreshToken: false,
                            persistSession: false,
                        },
                    });
                    return [4 /*yield*/, supabase.auth.getUser(token)];
                case 2:
                    _a = _d.sent(), user = _a.data.user, authError = _a.error;
                    if (authError || !user) {
                        console.log('[PAYMENTS DEBUG] Step 1 - Token verification FAILED:', {
                            hasAuthError: !!authError,
                            authErrorMessage: authError === null || authError === void 0 ? void 0 : authError.message,
                            hasUser: !!user
                        });
                        return [2 /*return*/, res.status(401).json({ error: 'Invalid token' })];
                    }
                    console.log('[PAYMENTS DEBUG] Step 1 - Token verified:', {
                        tokenLength: token.length,
                        userId: user.id
                    });
                    console.log('[PAYMENTS DEBUG] Step 2 - User found:', {
                        userId: user.id,
                        email: user.email,
                        userMetadata: user.user_metadata
                    });
                    return [4 /*yield*/, supabase
                            .from('user_access')
                            .select('*')
                            .eq('user_id', user.id)
                            .eq('is_active', true)
                            .gte('expires_at', new Date().toISOString())
                            .maybeSingle()];
                case 3:
                    _b = _d.sent(), access = _b.data, error = _b.error;
                    console.log('[PAYMENTS DEBUG] Step 3 - user_access result:', {
                        found: !!access,
                        error: error === null || error === void 0 ? void 0 : error.message,
                        data: access
                    });
                    return [4 /*yield*/, supabase
                            .from('user_manual_access')
                            .select('*')
                            .eq('user_id', user.id)
                            .eq('is_active', true)
                            .or('expires_at.is.null,expires_at.gte.' + new Date().toISOString())
                            .maybeSingle()];
                case 4:
                    _c = _d.sent(), manualAccess = _c.data, manualError = _c.error;
                    console.log('[PAYMENTS DEBUG] Step 4 - user_manual_access result:', {
                        found: !!manualAccess,
                        error: manualError === null || manualError === void 0 ? void 0 : manualError.message,
                        data: manualAccess
                    });
                    if (process.env.NODE_ENV === 'development') {
                        console.log('[Payments API] Manual access check:', {
                            userId: user.id,
                            hasManualAccess: !!manualAccess,
                            manualAccessExpiresAt: manualAccess === null || manualAccess === void 0 ? void 0 : manualAccess.expires_at,
                            hasPaymentAccess: !!access,
                            finalAccess: !!access || !!manualAccess,
                        });
                    }
                    if (error) {
                        console.error('Error checking access:', error);
                        return [2 /*return*/, res.status(500).json({ error: 'Failed to check access' })];
                    }
                    finalResponse = {
                        hasActiveAccess: !!access || !!manualAccess,
                        hasManualAccess: !!manualAccess,
                        manualAccessExpiresAt: (manualAccess === null || manualAccess === void 0 ? void 0 : manualAccess.expires_at) || null,
                        accessType: (access === null || access === void 0 ? void 0 : access.access_type) || 'manual',
                        expiresAt: (access === null || access === void 0 ? void 0 : access.expires_at) || (manualAccess === null || manualAccess === void 0 ? void 0 : manualAccess.expires_at) || null,
                    };
                    console.log('[PAYMENTS DEBUG] Step 5 - Final response:', {
                        hasActiveAccess: finalResponse.hasActiveAccess,
                        hasManualAccess: finalResponse.hasManualAccess,
                        accessType: finalResponse.accessType,
                        expiresAt: finalResponse.expiresAt
                    });
                    return [2 /*return*/, res.status(200).json(finalResponse)];
                case 5:
                    error_1 = _d.sent();
                    console.error('Error in /status:', error_1);
                    errorMessage = error_1 instanceof Error ? error_1.message : 'Unknown error';
                    return [2 /*return*/, res.status(500).json({ error: 'Internal server error', details: errorMessage })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
