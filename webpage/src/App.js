import './styles.css'
import React, { useEffect, useState } from 'react'

export default function App() {

	const [websites, setWebsites] = useState([])
	const [errorMessage, setErrorMessage] = useState()
	const [newWebsite, setNewWebsite] = useState()
	const [newRedirect, setNewRedirect] = useState()

	function removeWebsite(websiteToBeRemoved) {
		setWebsites(websites.filter(
			function (element) {
				return element !== websiteToBeRemoved;
			}
		))
	}

	function saveWebsites() {
		localStorage.setItem("sites", JSON.stringify(websites))
	}

	function addWebsite(e) {
		e.preventDefault()

		// checking the website to be blocked
		if (!newWebsite || !isValidWebsite(newWebsite)){
			setErrorMessage("Please enter a valid website")
			return
		}
		
		// checking the redirect website
		if (newRedirect){
			if (!isValidWebsite(newRedirect)) {
				setErrorMessage("Please enter a valid redirect website.")
				return
			}
		}

		// checking if the website has already been blocked
		for (const website of websites){
			if (website.block == newWebsite){
				setErrorMessage("That website is already blocked.")
				return
			}
		}

		// action
		setWebsites(websites.concat([{block: newWebsite, redirect: newRedirect || '#'}]))
		setNewWebsite('')
		setNewRedirect('')
		setErrorMessage('')

	}

	function isValidWebsite(website){
		return (!website.includes(' ') && website.includes('.'))
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
						<a class="navbar-brand"><span>Block</span> Site</a>
					</div>
				</div>
			</nav>
			<div className="main">
				<br />
				<div className="row" id="dashboard">

					<div className="col-lg-12">
						<form onSubmit={(e) => addWebsite(e)}>
							<div className="input-group">
								<input type="text" className="form-control input-md" placeholder="Add site to block" onChange={(e) => setNewWebsite(e.target.value)} value={newWebsite} />
								<input type="text" className="form-control input-md" placeholder="Add redirect (optional)" onChange={(e) => setNewRedirect(e.target.value)} value={newRedirect} />
								<button type='submit' className="btn btn-primary btn-md">
									Add
								</button>
							</div>
						</form>

						<br />

						<p>{errorMessage}</p>
					</div>

					<div className="col-lg-12">
						<div className="table">
							<table className="table table-bordered table-hover">
								<thead>
									<tr>
										<th>
											Blocked ({websites.length})
										</th>
										<th>
											Redirects
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
													<a>{website.block}</a>
												</td>
												<td className='site_name'>
													<a>{website.redirect}</a>
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