import DashboardLayout from "./layout";

const NotFoundPage = () => {
	return (
		<DashboardLayout>
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-center">
					<div className="text-black text-9xl font-black">
						<h1 className="italic">404...</h1>
						<p className="text-3xl mt-4">Página no encontrada.</p>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
};

export default NotFoundPage;
