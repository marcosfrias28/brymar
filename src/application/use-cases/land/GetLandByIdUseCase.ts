import { ILandRepository } from '@/domain/land/repositories/ILandRepository';
import { LandId } from '@/domain/land/value-objects/LandId';
import { GetLandByIdInput } from '@/application/dto/land/GetLandByIdInput';
import { GetLandByIdOutput } from '@/application/dto/land/GetLandByIdOutput';
import { UseCaseExecutionError } from '@/application/errors/ApplicationError';

/**
 * Use case for getting a land by ID
 */
export class GetLandByIdUseCase {
    constructor(
        private readonly landRepository: ILandRepository
    ) { }

    async execute(input: GetLandByIdInput): Promise<GetLandByIdOutput | null> {
        try {
            const landId = LandId.create(input.id);
            const land = await this.landRepository.findById(landId);

            if (!land) {
                return null;
            }

            return GetLandByIdOutput.fromLand(land);
        } catch (error) {
            throw new UseCaseExecutionError(
                'Failed to get land by ID',
                'GetLandByIdUseCase',
                error instanceof Error ? error : undefined
            );
        }
    }
}