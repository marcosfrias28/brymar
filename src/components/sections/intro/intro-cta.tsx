import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "../../ui/button";

interface IntroCTAProps {
	title: string;
	cta: string;
	WordsStyle: string;
	italianno: any;
}

export const IntroCTA: React.FC<IntroCTAProps> = ({
	title,
	cta,
	WordsStyle,
	italianno,
}) => {
	const [firstWord, ...introPhrase] = title.split(" ");
	const lastWord = introPhrase.pop();

	return (
		<section className="relative text-white flex max-w-4xl flex-col items-center text-center mx-auto">
			<div className="pointer-events-none px-10">
				<p
					className={cn(
						"font-sans font-black desktop:text-8xl smartphone:text-7xl smartphonexs:text-4xl",
						"text-pretty",
					)}
				>
					<span className={cn(WordsStyle, "font-thin font-serif bg-aurora")}>
						{firstWord?.concat(" ")}
					</span>
					<span>{introPhrase.join(" ").concat(" ")}</span>
				</p>
				<span
					className={cn(
						italianno.className,
						"text-[250px] tablet:text-[350px] smartphonexs:text-[200px] inline-block -mt-56 max-md:-mt-32 -mb-48",
						WordsStyle,
					)}
				>
					{lastWord}
				</span>
			</div>
			<Link href="/search">
				<Button
					variant="outline"
					className={cn(
						"relative",
						"smartphonexs:mt-4 p-6 text-3xl smartphonexs:text-xl self-center",
						"border-white rounded-lg text-foreground",
						"hover:transition-all active:border-green-800 bg-background",
					)}
				>
					<span>{cta}</span>
				</Button>
			</Link>
		</section>
	);
};
