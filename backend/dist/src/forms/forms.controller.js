"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormsController = void 0;
const common_1 = require("@nestjs/common");
const forms_service_1 = require("./forms.service");
const create_form_dto_1 = require("./dto/create-form.dto");
const update_form_dto_1 = require("./dto/update-form.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const create_form_field_dto_1 = require("./dto/create-form-field.dto");
let FormsController = class FormsController {
    constructor(formsService) {
        this.formsService = formsService;
    }
    create(req, createFormDto) {
        return this.formsService.create(req.user.id, createFormDto);
    }
    findAll(req) {
        return this.formsService.findAll(req.user.id, req.user.role);
    }
    findOne(id, req) {
        return this.formsService.findOne(id, req.user.id, req.user.role);
    }
    update(id, req, updateFormDto) {
        return this.formsService.update(id, req.user.id, req.user.role, updateFormDto);
    }
    remove(id, req) {
        return this.formsService.remove(id, req.user.id, req.user.role);
    }
    addField(id, req, createFormFieldDto) {
        return this.formsService.addField(id, req.user.id, req.user.role, createFormFieldDto);
    }
    updateField(id, fieldId, req, updateFormFieldDto) {
        return this.formsService.updateField(id, fieldId, req.user.id, req.user.role, updateFormFieldDto);
    }
    removeField(id, fieldId, req) {
        return this.formsService.removeField(id, fieldId, req.user.id, req.user.role);
    }
    findPublicForm(clientId, slug) {
        return this.formsService.findBySlug(clientId, slug);
    }
};
exports.FormsController = FormsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_form_dto_1.CreateFormDto]),
    __metadata("design:returntype", void 0)
], FormsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FormsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FormsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_form_dto_1.UpdateFormDto]),
    __metadata("design:returntype", void 0)
], FormsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FormsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/fields'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_form_field_dto_1.CreateFormFieldDto]),
    __metadata("design:returntype", void 0)
], FormsController.prototype, "addField", null);
__decorate([
    (0, common_1.Patch)(':id/fields/:fieldId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('fieldId')),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, create_form_field_dto_1.CreateFormFieldDto]),
    __metadata("design:returntype", void 0)
], FormsController.prototype, "updateField", null);
__decorate([
    (0, common_1.Delete)(':id/fields/:fieldId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('fieldId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], FormsController.prototype, "removeField", null);
__decorate([
    (0, common_1.Get)('public/:clientId/:slug'),
    __param(0, (0, common_1.Param)('clientId')),
    __param(1, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FormsController.prototype, "findPublicForm", null);
exports.FormsController = FormsController = __decorate([
    (0, common_1.Controller)('forms'),
    __metadata("design:paramtypes", [forms_service_1.FormsService])
], FormsController);
//# sourceMappingURL=forms.controller.js.map