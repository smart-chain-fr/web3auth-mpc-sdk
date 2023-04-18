"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tKey = void 0;
const core_1 = __importDefault(require("@tkey/core"));
const service_provider_torus_1 = require("@tkey/service-provider-torus");
const storage_layer_torus_1 = require("@tkey/storage-layer-torus");
const share_serialization_1 = require("@tkey/share-serialization");
const torusSp = new service_provider_torus_1.TorusServiceProvider({
    useTSS: true,
    customAuthArgs: {
        baseUrl: `${window.location.origin}/serviceworker`,
        enableLogging: true,
    },
});
const storageLayer = new storage_layer_torus_1.TorusStorageLayer({
    hostUrl: "https://sapphire-dev-2-1.authnetwork.dev/metadata",
    enableLogging: true,
});
const shareSerializationModule = new share_serialization_1.ShareSerializationModule();
exports.tKey = new core_1.default({
    enableLogging: true,
    serviceProvider: torusSp,
    storageLayer: storageLayer,
    manualSync: true,
    modules: {
        shareSerialization: shareSerializationModule,
    },
});
