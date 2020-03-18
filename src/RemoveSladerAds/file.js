(function() {
  console.log("Remove Slader Ads by Miguel T. https://migueltenant.com");
  var self = this.SladerInterstitial;
  if (self && !self.intFinishCalled) {
    self.intFinishCalled = true;
    $("body").removeClass("interstitial-active");
    $("#video-interstitial-lkqd").html("");
    var gid = $(".interstitial-modal").data("gid");
    var solutionsList = $(".solutions-list");
    $(".solution-gate-container").remove();
    if (
      solutionsList.length &&
      solutionsList.hasClass("cheatsheet-solutions")
    ) {
      Slader.Solutions.loadNextCheatsheetPage(gid);
    } else {
      Slader.Solutions.reloadSolutions(gid);
    }
  }
})();
