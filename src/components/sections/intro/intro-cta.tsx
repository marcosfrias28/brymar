import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "../../ui/button";

type IntroCTAProps = {
	title: string;
	cta: string;
	WordsStyle: string;
	italianno: any;
};

export const IntroCTA: React.FC<IntroCTAProps> = ({
	title,
	cta,
	WordsStyle,
	italianno,
}) => {
	const [firstWord, ...introPhrase] = title.split(" ");
	const lastWord = introPhrase.pop();

	return (
		<section className="relative mx-auto flex max-w-4xl flex-col items-center text-center text-white">
			<div className="pointer-events-none px-10">
				<p
					className={cn(
						"font-black font-sans desktop:text-8xl smartphone:text-7xl smartphonexs:text-4xl",
						"text-pretty"
					)}
				>
					<span className={cn(WordsStyle, "bg-aurora font-serif font-thin")}>
						{firstWord?.concat(" ")}
					</span>
					<span>{introPhrase.join(" ").concat(" ")}</span>
				</p>
				<span
					className={cn(
						italianno.className,
						"-mt-56 max-xl:-mt-32 -mb-48 inline-block tablet:text-[350px] text-[250px] smartphonexs:text-[200px]",
						WordsStyle
					)}
				>
					{lastWord}
				</span>
			</div>
			<Link href="/search">
				<Button
					className={cn(
						"relative",
						"self-center p-6 text-3xl smartphonexs:mt-4 smartphonexs:text-xl",
						"rounded-lg border-white text-foreground",
						"bg-background hover:transition-all active:border-green-800"
					)}
					variant="outline"
				>
					<span>{cta}</span>
				</Button>
			</Link>
		</section>
	);
};
