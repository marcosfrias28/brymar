import { Upload } from "lucide-react";

type FileUploadZoneProps = {
	id: string;
	accept: string;
	disabled: boolean;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	label: string;
	description: string;
};

export function FileUploadZone({
	id,
	accept,
	disabled,
	onChange,
	label,
	description,
}: FileUploadZoneProps) {
	return (
		<div className="flex w-full items-center justify-center">
			<label
				className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-gray-300 border-dashed bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
				htmlFor={id}
			>
				<div className="flex flex-col items-center justify-center pt-5 pb-6">
					<Upload
						className="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400"
						strokeWidth={1.5}
					/>
					<p className="mb-2 text-gray-500 text-sm dark:text-gray-400">
						<span className="font-semibold">{label}</span> o arrastra y suelta
					</p>
					<p className="text-gray-500 text-xs dark:text-gray-400">
						{description}
					</p>
				</div>
				<input
					accept={accept}
					className="hidden"
					disabled={disabled}
					id={id}
					multiple
					onChange={onChange}
					type="file"
				/>
			</label>
		</div>
	);
}
