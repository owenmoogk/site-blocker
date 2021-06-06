
export default function App() {
	return (
		<div>
			<nav class="navbar navbar-custom navbar-fixed-top">
				<div class="container-fluid">
					<div class="navbar-header">
						<a class="navbar-brand" href="#"><span>Block</span> Site</a>
					</div>
				</div>
			</nav>

			<div id="sidebar-collapse" class="col-sm-3 col-lg-2 sidebar">

				<div class="divider"></div>
				<ul class="nav menu">
					<li>
						<a><i class="fa fa-align-justify"></i> Dashboard</a>
					</li>
				</ul>

			</div>

			<div class="col-sm-9 col-sm-offset-3 col-lg-10 col-lg-offset-2 main">

				<br />

				<div class="row" id="dashboard">

					<div class="col-lg-12">
						<div class="input-group">
							<input type="text" class="form-control input-md" placeholder="Add site to block" id="custom_site" />
							<span class="input-group-btn">
								<button class="btn btn-primary btn-md" id="submitButton">
									Add
						</button>
							</span>
						</div>
					</div>


					<div class="col-lg-12">
						<br />
						<div class="table-responsive">
							<table class="table table-bordered table-hover">
								<thead>
									<tr>
										<th>
											{/* Blocked List ({{ siteList.length }}) */}
											<span><i class="fa fa-sort"></i></span>
										</th>
										<th class="action_btns">
											<div class="btn-group">
												<button class="btn btn-primary" title="Save changes">
													<i class="fa fa-save"></i>
												</button>
												<button class="btn" title="Clear List">
													<i class="fa fa-trash"></i>
												</button>
											</div>
										</th>

									</tr>
								</thead>
								<tbody>
									<tr>
										<td class='site_name'>
											<a target='_blank'>{ 'site' }</a>
										</td>
										<td class='td_btn'>
											<i class="fa fa-minus-circle"></i>
										</td>
									</tr>


								</tbody>
							</table>
						</div>

						<p class="text-center">
							<button class="btn btn-primary">
								<i class="fa fa-save"></i> Save changes
					</button>
						</p>

					</div>

				</div>
			</div>
		</div>
	);
}