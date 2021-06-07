import './styles.css'
import React, { useEffect, useState } from 'react'

export default function App() {

	const [websites, setWebsites] = useState([])
	const [newWebsite, setNewWebsite] = useState()
	const [errorMessage, setErrorMessage] = useState()

	function removeWebsite(websiteToBeRemoved) {
		setWebsites(websites.filter(
			function (element) {
				return element != websiteToBeRemoved;
			}
		))
	}

	function saveWebsites() {
		localStorage.setItem("sites", JSON.stringify(websites))
	}

	function addWebsite() {
		if ((!newWebsite.includes(' ')) && newWebsite.includes('.')) {
			if (websites.indexOf(newWebsite) == -1) {
				setWebsites(websites.concat([newWebsite]))
				setNewWebsite('')
				setErrorMessage('')
			}
			else {
				setErrorMessage("That website is already blocked.")
			}
		}
		else {
			setErrorMessage('That is not a valid website')
		}
	}

	useEffect(() => {
		var currWebsites = JSON.parse(localStorage.getItem('sites'))
		if (currWebsites != null) {
			setWebsites(currWebsites)
		}
	}, [])

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
			<div className="main">
				<br />
				<div className="row" id="dashboard">

					<div className="col-lg-12">
						<div className="input-group">

							<input type="text" className="form-control input-md" placeholder="Add site to block" onChange={(e) => setNewWebsite(e.target.value)} value={newWebsite} />

							<span className="input-group-btn">
								<button className="btn btn-primary btn-md" id="submitButton" onClick={() => addWebsite()}>
									Add
							</button>
							</span>
						</div>

						<br />

						<p>{errorMessage}</p>
					</div>

					<div className="col-lg-12">
						<div className="table">
							<table className="table table-bordered table-hover">
								<thead>
									<tr>
										<th>
											Blocked List ({websites.length})
									</th>
										<th className="action_btns">
											<div className="btn-group">
												<button className="btn btn-primary" title="Save changes">
													<i className="fa fa-save"></i>
												</button>
												<button className="btn" title="Clear List">
													<i className="fa fa-trash"></i>
												</button>
											</div>
										</th>

									</tr>
								</thead>
								<tbody>
									{websites.map((website, i) => {
										return (
											<tr key={i}>
												<td className='site_name'>
													<a target='_blank'>{website}</a>
												</td>
												<td className='td_btn'>
													<i className="fa fa-minus-circle" onClick={() => removeWebsite(website)}></i>
												</td>
											</tr>
										)
									})}
								</tbody>
							</table>
						</div>

						<p className="text-center">
							<button className="btn btn-primary" onClick={() => saveWebsites()}>
								<i className="fa fa-save"></i> Save changes
						</button>
						</p>

					</div>

				</div>
			</div>
		</div>
	)
}