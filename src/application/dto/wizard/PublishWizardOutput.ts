export class PublishWizardOutput {
    constructor(
        public readonly publishedId: number,
        public readonly wizardType: string,
        public readonly title: string,
        public readonly publishedAt: Date,
        public readonly draftId?: string
    ) { }

    static create(data: {
        publishedId: number;
        wizardType: string;
        title: string;
        publishedAt?: Date;
        draftId?: string;
    }): PublishWizardOutput {
        return new PublishWizardOutput(
            data.publishedId,
            data.wizardType,
            data.title,
            data.publishedAt || new Date(),
            data.draftId
        );
    }

    toJSON(): Record<string, any> {
        return {
            publishedId: this.publishedId,
            wizardType: this.wizardType,
            title: this.title,
            publishedAt: this.publishedAt.toISOString(),
            draftId: this.draftId,
        };
    }
}