import DashboardLayout from "./layout";

const NotFoundPage = () => (
	<DashboardLayout>
		<div className="flex min-h-screen items-center justify-center bg-gray-50">
			<div className="text-center">
				<div className="font-black text-9xl text-black">
					<h1 className="italic">404...</h1>
					<p className="mt-4 text-3xl">Página no encontrada.</p>
				</div>
			</div>
		</div>
	</DashboardLayout>
);

export default NotFoundPage;
