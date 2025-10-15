import { IPropertyRepository } from "@/domain/property/repositories/IPropertyRepository";
import { GetPropertyByIdInput } from "@/application/dto/property/GetPropertyByIdInput";
import { GetPropertyByIdOutput } from "@/application/dto/property/GetPropertyByIdOutput";
import { PropertyId } from "@/domain/property/value-objects/PropertyId";
import { UseCaseExecutionError } from "@/application/errors/ApplicationError";

export class GetPropertyByIdUseCase {
    constructor(
        private readonly propertyRepository: IPropertyRepository
    ) { }

    async execute(input: GetPropertyByIdInput): Promise<GetPropertyByIdOutput | null> {
        try {
            const propertyId = PropertyId.create(input.id);
            const property = await this.propertyRepository.findById(propertyId);

            if (!property) {
                return null;
            }

            return GetPropertyByIdOutput.fromProperty(property);
        } catch (error) {
            throw new UseCaseExecutionError(
                `Failed to get property by id: ${error instanceof Error ? error.message : 'Unknown error'}`,
                'GetPropertyByIdUseCase',
                error instanceof Error ? error : undefined
            );
        }
    }
}