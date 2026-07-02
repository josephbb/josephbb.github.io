---
layout: post
title: The Preregistration Revelation
date:   2024-06-05
description: 
tags: metascience openscience 
categories: [metascience, statistics]
---

Correcting erroneous or misleading findings in the scientific literature is feature of science that is as important as it challenging, time-consuming, risky, and fraught. Doing it well requires, risks, and rewards more than [circling p-values and blasting them to Twitter](https://joebakcoleman.com/blog/2023/pcurve/). Recognizing this need, metascientists over the past decade have emphasized the need to detect errors and protect those surfacing concerns. While we all might differ in what we consider rigorous and thoughtful critique, there's little disagreement that we need more not less and those raising concerns should be able to do so freely. 

In my career I've spent an inordinate amount of time addressing false and misleading claims, within and beyond science. It has resulted in me being [sued for defamation](https://www.geekwire.com/2021/mainstream-media-critic-project-veritas-sues-university-washington-stanford-alleging-defamation-social-media-researchers/), led to [bad-faith and incorrect accusations](https://x.com/WashburneAlex/status/1495430722445709313) that I failed to obtain ethical approval for research, and [dragged me into  conspiracy theories](https://justthenews.com/nation/free-speech/tuevirality-circuit-breakers-taxpayer-funded-researchers-devise-new-stealth). These bad outcomes don't tell the full story, however, and I've had a number of remarkably wonderful and productive conversations with researchers after alerting them to errors. 

This was the outcome I expected late last year, when I noticed issues in an article published in [Nature Human Behavior](https://www.nature.com/articles/s41562-023-01749-9) by some heavy-hitters in metascience. As the issues partially involved the preregistration, it was notable that the authorship included people responsible for the two major platforms used to preregister Brian Nosek (OSF) and Leif Nelson (AsPredicted). The latter, a member of [data colada](https://datacolada.org/) has been a prominent scientific whistleblower, around whom the community [rallied to support](https://datacolada.org/113) when sleuthing led to litigation. Given the authorship and broader community in which the paper was published, I assumed this would be straightforward and painless. I assumed incorrectly. 


### The preregistration revelation

The paper came across my radar when a colleague, Berna Devezer, was asked to comment on it for [Science](https://www.science.org/content/article/preregistering-transparency-and-large-samples-boost-psychology-studies-replication-rate). In that article, Erkan Buzbas pointed out the key conclusions appeared to rely on a cherry-picked metric of replication. 

![Buzbas](/assets/img/buzbas.png){: width="750" }

Berna and I decided to work up a matters arising, identifying key issues with the causal claims in the paper. One of the more peculiar things we noticed is that the definition of replication success was incoherent and without precedent in the literature. It also seemed to maximize replication compared to other, more standard metrics. It sure looked a lot like cherry-picking, yet Nosek [indicated on Blueksy](https://bsky.app/profile/briannosek.bsky.social/post/3kdtkzf5ciw2c) that the choice of metrics to emphasize and report was constrained by documentation (e.g. a prereg). 

![Buzbas](/assets/img/nosekprimaryoutcome.png){: width="750" }

This post implies that replicability was a preregistered, primary outcome. Although bizarrely not mentioned in the confirmatory analyses of the main text, [the supplement](https://static-content.springer.com/esm/art%3A10.1038%2Fs41562-023-01749-9/MediaObjects/41562_2023_1749_MOESM1_ESM.pdf) description of confirmatory analyses clearly indicates the reported replication metric was a preregistered primary outcome outcome, noting:

>Studies were coded as 1 if they produced a statistically significant result in the direction expected by theory and 0 if they did not reach statistical significance [no study showed statistically significant effects in the opposite direction].

Our matters arising critique did not depend wholly on whether or not this metric was preregistered but there was no way to avoid checking if this was the case. 

Digging into the preregistration, it was immediately clear that something was amiss. The preregistration seemed to lay out a very thorough and (honestly elegant) test of a [supernatural hypothesis](https://www.nature.com/articles/470437a) surrounding the decline effect. Not only is the emphasized replication metric not preregistered---none were. All of the very clearly described models examining the causal effect of researchers collecting and analyzing data on the observed effect sizes in the real world. 

Jessica Hullman wrote a [blog post](https://statmodeling.stat.columbia.edu/2024/03/27/the-feel-good-open-science-story-versus-the-preregistration-who-do-you-think-wins/) detailing some of the discrepencies. For the purposes of this post it's enough to know that carefully comparing the code to the published text made it clear that the majority of analyses were either not present in the available preregistration or contained undisclosed deviations.  

### Reaching out 
Not wanting to waste anyone's time, I went through the code, paper, and preregistration(s) line by line and it became very clear that this was more than just failing to preregister a single metric. This made it abundantly clear that the paper was headed for retraction. Briefly, the documentation about planned analyses was remarkably consistent and unambigous from the earliest operations manuals through the second preregistration filed near the end of data collection. A [talk by Schooler](https://www.youtube.com/watch?v=VRv7KlvQHS0) in 2019 on preliminary data indicated the analyses had indeed evolved. Setting aside the fairly blatant outcome swapping and other QRPs, it didn't seem feasible to issue a correction identifying all of the deviations, added models, and reconciling inconsistency between the main text and supplement. 

Given this, I reached out to several colleagues who known Brian Nosek and several of the other authors for years. They agreed that retraction looked inevitable, and suggested I reach out to Brian and Protzko and clearly highlight the seriousness of the issues. If no documentation existed, this would give them the opportunity to retract and resubmit on their own terms. 

Following this, I reached out and shared a detailed annotated version of the paper indicating what I couldn't reconcile. Below is an excerpt from my email: 

>I understand that preregistration is often a plan, not a prison, yet the gap between the paper and the preregistrations is such that the vast majority of the results section, particularly analyses on which the main claims rest, appear exploratory without any note to that effect. I wanted to make sure I’m not missing something that could be cleared up with a simple OSF link. Hopefully this is a quick fix and there’s just a pdf from 2016 or whatnot that I’m missing. On the off chance there wasn’t, and there was some kerfuffle between the pre-reg, the analysis, and the write-up… I thought it bet to first reach out privately and directly.

Brian noted that he was traveling and suggested I had the wrong documentation corresponding to an earlier aim of the study and that Protzko should have it. Protzko indicated that Pustejovsky would know. Eventually they suggested that the team charged with organizing thing would know. 

Importantly, this isn't some obscura ephemera related simply to a single descriptive measure. It's a preregistration, corresponding to the bulk of the analyses as performed, presumably on one of two preregistration websites which the authors incidentally founded. Brian confidently asserted that documentation existed and was the reason for the choice of one metric over the other in the bluesy post above. Protzko and Pustejovsky are listed as being responsible for the analysis, and presumably had the .pdf open when writing the analysis and paper. Every authors should know where it is from doing due dilligence comparing the paper to the prereg to identify deviations. It is the Plan behind a paper they had just published. It is unfathomable that it just went missing. I felt confident posting our matters arising and indicating that the authors had (as of yet) been unable to produce the relevant documentation. 

### Blowback and Damage Control
On November 21st, Jessica Hullman wrote a [blog post](https://statmodeling.stat.columbia.edu/2023/11/21/of-course-its-preregistered-just-give-me-a-sec/) remarking on the absurdity of the situation. It certainly had an uncanny resemblance to the dog-ate-my-data responses one often encounters when the data are available upon request. Given the authors' past work, Jessica's post did not go unnoticed. 

It's important to note that while a timely upload of our matters arising made it clear we couldn't find the preregistration, I refrained from making public the totality of what I'd found. It pointed to a much more serious set of issues, something I didn't feel was appropriate to address in a flurry of skeets or a blog post. The reaction we got was not welcoming timely critique and flagging of issues, but instead to be [accused of dog-piling](https://bsky.app/profile/babeheim.bsky.social/post/3kereho7kbv2d). 

![Carl's Post](/assets/img/carlpost.png){: width="750" }





### Background


As a bit of a personal case study, this post chronicles my experiences attempting to correct the record for a paper by *Protzko Et al.* in 2023. Along with Berna Devezer, I penned a matters arising highlighting some of the causal issues with these claims. I wont' rehash them here, but one of the key issues surrounded apparent cherry-picking of a metric when conflicting metrics told a different story. The metric was implicitly fraught, such that it doesn't *really* matter if it was preregistered but to make our case we had to check. Doing so revealed the paper [incorrectly described what was prereregistered in numerous places, and appeared to obscure its original intent](https://statmodeling.stat.columbia.edu/2024/03/27/the-feel-good-open-science-story-versus-the-preregistration-who-do-you-think-wins/). Separate from our Matters Arising, concerns regarding the integrity of the manuscript were raised with the journal which ultimately decided to [decision].

I've largely refrained from sharing the details of what I found publicly. Jessica's [blog post](https://statmodeling.stat.columbia.edu/2024/03/27/the-feel-good-open-science-story-versus-the-preregistration-who-do-you-think-wins) hits the high notes, and I don't have much to substantively add. In short? The [preregistration](https://osf.io/938rv/) is exceedingly clear about what analyses will be conducted, down to exact model specifications. It makes no mention of replicability, does not describe the key meta-analysis, and the few models that bear similarity to main text models are deviated without description in the text. This is not some minor deviation, it is claiming several primary analyses are preregistered when they were not. Moreover, as we note in our matters arising, the absence of a preregistration opens up the possibility for cherry-picking, HARKing, and selective reporting. The inaccurate description here does qualitatively impact the claims and findings.  

### How FAIR should one be? 

Before putting up our matters arising, we wanted to be sure that we didn't miss a preregistration somewhere on OSF. To ensure the accuracy of our MA, I pinged Protzko and Nosek asking if there was something obvious we missed. Nosek said that Protzko would likely know, who in turn looped in Pustejovsky. I even offered to walk through what I'd found and where I'd looked. 

The authors were quick to respond, yet days later nothing had surfaced. This was alarming for several reasons. The paper had just come out. Two of the authors (Nosek and Nelson) were major advocates of preregistration, creating and maintaining platforms for making preregistrations [Findable and Accessible](https://www.go-fair.org/fair-principles/). This is ostensibly the key document that guided the analysis and write-up, how could it be lost? 

Supposing it somehow did, I'm happy waiting until they find the corner of OSF the file is sitting on. Protzko is prolific with regard to preregistration and has [over 1000 registrations on OSF](https://osf.io/search?activeFilters=%5B%7B%22propertyVisibleLabel%22%3A%22Creator%22%2C%22propertyPathKey%22%3A%22creator%22%2C%22label%22%3A%22John%20Protzko%22%2C%22value%22%3A%22https%3A%2F%2Fosf.io%2F8bpwe%22%7D%5D&q=protzko&resourceType=Registration%2CRegistrationComponent), which could understandably take time to comb through. Yet Protzko and Pustejovsky (on the email chain) are listed in the contributions as responsible for the analysis. How could they not instantly at least confirm whether a document exists that they followed when creating the [main analysis code](https://osf.io/rqwn2)? Lest we forget this is a study in part about the value of making, following and sharing preregistrations. It's beyond belief that a preregistration was created, followed without deviation, lost, and collectively memory-holed by the authorship. It started to feel like I was getting the runaround.  

Given this, It felt fair to put our piece up complete with noting our inability to find a corresponding preregistration. This led to a [blog post](https://statmodeling.stat.columbia.edu/2023/11/21/of-course-its-preregistered-just-give-me-a-sec/) by Jessica Hullman, noting the absurdity of the apparently missing or non-existent preregistration. Hubub on social media, in turn prompted Nosek to make a bit of a [public statement](https://bsky.app/profile/briannosek.bsky.social/post/3keubpwanrw2v): 


![Brian Nosek Post](/assets/img/nosekstatement.png){: width="750" }

This seemed remarkably misleading. "Descriptive reporting" here is obscuring the fact that apparently unplanned descriptive analyses were key evidence in support of the titular claim. Beyond things that could reasonably be called descriptive, the first confirmatory analysis listed in the paper, a meta-analysis, did not seemed to be preregistered. Others had clear deviations. Only one of the analyses of the primary dataset clearly corresponded to the available preregistrations. 

Notably, those preregistrations were from 2018 and 2019... not 2013. They are consistent with the [operations manuals](https://osf.io/hbxws/) going back a decade. These don't lay out estabishing high replicability is possible, but instead examine a [supernatural explanation for declining effect sizes](https://www.nature.com/articles/470437a). Even a [chapter](https://psycnet.apa.org/record/2017-24429-006) written by Schooler and Protzko confirms the experiment was designed to test this.

For the 2013 OSF feature set to have caused hiccups in preregistration, there had to be some preregistration that was similar but not identical to the ones in 2018 and 2019. Nor was it mentioned in these preregistrations, and involved tests and comparisons not stated in the operations manual. This 2013 preregistration must have contained the meta-analysis and deviated forms of other hypothesis tests, but perhaps missed out on the "descriptive" comparisons. Moreover, it would have been followed by Pustejovsky in 2020 (ignoring the other preregistrations), only to be lost and memory-holed by the time they received my email.

Retraction watch suggests not going to authors first, because it gives them a chance to [cover their tracks](https://retractionwatch.com/2015/11/30/a-retraction-watch-retraction-our-2013-advice-on-reporting-misconduct-turns-out-to-have-been-wrong/). I disagree with this, and almost always contact authors before going to a journal or institution. Especially when I have every reason to believe the authors may have simply made a mistake and would be willing to own up to it. However, the sense that I was getting the runaround and the spin put on the whole thing by the authors prompted me to reach out to Nature Human Behavior. 

### Facing Fallout 
This paper comes out of the heart of the metascience community, and one that has spent a decade campaigning for the rights of whistleblowers. Nearly $400K dollars were raised to support legal defense of Data Colada, who were sued after investigating [Francesca Gino](https://www.chronicle.com/article/a-weird-research-misconduct-scandal-about-dishonesty-just-got-weirder?sra=true). Indeed, one of the members of Data Colada was an author on the paper in question. Given this, one might expect blowing the whistle on a paper inside of metascience would be relatively pain-free. 

More or less immediately after posting my concerns, Ian Hussey shared a meme mocking me for having reservations about [lazy public sleuthing](https://joebakcoleman.com/blog/2023/pcurve/) and the extent to which preregistration can fix science. This meme was reshared by his advisor (Malte Elson, we'll come back to that). 

![Ian Hussey's Post](/assets/img/hussey.png){: width="750" }

As a sharp counter-point to Ian's post, Bret Beheim seemed to take the opposite issue with our matters arising and Jessica's post. Now, it seems, were [were not being sufficiently civil](https://bsky.app/profile/carlbergstrom.com/post/3kevhscgpyx2d) in disclosing the authors couldn't find a relevant preregistration. 

![Bret's Post](/assets/img/beheimscreenshot.png){: width="750" }

It's worth noting that, at this point, I'd compiled a dozen pages indicating discrepencies between the code, preregistration, and published work. I didn't share this publicly, and only indicated the bare minimum necessary to establish the claims in our matters arising. Instead, I had privately sent this off to editors at *Nature Human Behavior*. In the spirit of cooperation, I offered for my identity to be shared with the authors in case they wanted to reach out with questions. My goal was to get this resolved, not to make or be part of a spectacle. 

### Wagon-circling 

Critically, I did not indicate that I was willing to be publicly identified as the source of the concerns. If you've never been a whistleblower for a journal before, it's pretty hands-off and there's little reason to identify yourself publicly. You submit the concern, even anonymously. If the authors find it credible, it goes through their investigation process and you find out what happened afterwards. You don't necessarily get any insight into who is investigating, what they've found, what the authors have said, etc...  Moreover, myself and anyone else involve were requested to remain silent about the details of investigation while it was ongoing. 

You'll imagine my surprise, then, when during the investigation Lakens outed himself as one of the people reviewing my concerns, defended the paper. He also outed me as the source of the concerns. 

![Daniel's Post](/assets/img/lakensdoxx.png){: width="750" }

Worse still, this post is filled with fabrications. Berna was not involved in raising the concerns to the reviewers, only writing the Matters arising. I sent additional concerns after the authors posted considerable documentation which made it very clear that the analyses were not preregistered. This was not because I was unhappy... I hadn't heard anything to be unhappy about. It is difficult to overstate how inappropriate it is not only doxx a whistleblower but to do so alongside lies undermining them and defending the accused. 

We notified the editors, and they reminded him the process was confidential and asked him to take the post down. He apologized in the style of someone hiring a skywriter on a budget. 

![Daniel's Post](/assets/img/sincerapology.png){: width="750" }


Natures need-to-know process of handling these things raises other questions. How would Daniel know if the authors had seen the reviews yet? My understanding is that the reviewers are not updated at each step of the process, seeming to suggest he spoke with the authors about the status of the investigation. Similarly, my initial concerns were much deeper than the reproducibility estimate, yet Daniel's post echoes Bryan's above spinning this as merely an issue with that estimate. 

Fortunately, any uncertainy surrounding Lakens objectivity here was resolved a few days after initially being told to stop discussing the case. In response to another poster commenting about the paper, he wrote: 

![Daniel's Post](/assets/img/lakensregret.png){: width="750" }

This whole incident made me realize that my concerns seemed like they were being handled by the original reviewers of the manuscript. If so, the other person handling the investigation was Malte Elson. Malte, if you'll remember, reshared a post mocking me when we first made the Matters arising public. 


### What has preregistration won? 

In the logic of the posts above, my critique was made possible because I could compare their preregistration to the analysis and discover deviations. This is trivially incorrect as even if the preregistration had perfectly specified the analysis plan, our Matters arising would have been largely unchanged. Preregistering a causally inappropriate analysis with a fraught outcome doesn't make it correct. 

Setting this aside, what precisely is preregistration able to win here? When I noticed these concerns, I dug around to see whether deviations from a preregistration had *ever* lead to correction of the scientific literature. Despite [undisclosed deviations being common](https://royalsocietypublishing.org/doi/10.1098/rsos.211037), and certainly impacting results, I couldn't find a single example of a paper retracted or corrected because someone noticed a discrepancy with the preregistration.

Hell, there's a dozen or so papers on long-covid in top journals, by the same group, that all claim to be "pre-specified" yet lack any links to a preregistration. Indeed, the authors even state they based their outcomes on previous findings using the same database, similar analysis, and outcomes. It's clear this isn't meaningfully preregistered or prespecified. Here's [one example](https://www.nature.com/articles/s41591-022-02001-z), where even the negative outcome controls inexplicably change between preprint and publication. Fundamental issues with these studies were [pointed out](https://www.bmj.com/content/376/bmj-2021-068993/rr-2) in formal response to another paper. Yet the papers remain published in top journals, described in major news outlets, and [informing policy](https://www.help.senate.gov/download/al-aly-testimony&ved=2ahUKEwiUq9ia25yHAxXoFVkFHTeSC4cQFnoECA8QAQ&usg=AOvVaw3jFod64bqyVFMmVLvrJCVA).

Taken together, once a paper is published there is little evidence that the presence of a preregistration can reliably impact the accuracy of the scientific record. Even when claims analyses were specified are unsubstantiated, papers can remain published an impactful. As noted above, getting a preregistration that wasn't published can lead to [the same runaround](https://statmodeling.stat.columbia.edu/2023/11/21/of-course-its-preregistered-just-give-me-a-sec/) we get with data available upon request. 

### Peer-review

What about before its published? Peer reviewers are well posted to alter the shape and outcome of a manuscript based on comparison of the paper with its preregistration. Unfortunately, [evidence suggests](https://osf.io/preprints/psyarxiv/nh7qw) that a paper has only a 10% chance of having its preregistration compared to the analysis, and most of the time the preregistration doesn't even come up in peer review. 

