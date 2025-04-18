"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateFormFieldDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_form_field_dto_1 = require("./create-form-field.dto");
class UpdateFormFieldDto extends (0, mapped_types_1.PartialType)(create_form_field_dto_1.CreateFormFieldDto) {
}
exports.UpdateFormFieldDto = UpdateFormFieldDto;
//# sourceMappingURL=update-form-field.dto.js.map