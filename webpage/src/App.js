import PageAdder from './PageAdder'
import './styles.css'

export default function App() {
	return (
		<div>
			{/* top bar */}
			<nav class="navbar navbar-custom navbar-fixed-top">
				<div class="container-fluid">
					<div class="navbar-header">
						<a class="navbar-brand" href="#"><span>Block</span> Site</a>
					</div>
				</div>
			</nav>
			<PageAdder/>
		</div>
	);
}