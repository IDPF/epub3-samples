# EPUB 3 Samples

This repository contains the source for a variety of EPUB 3 sample documents. The collection is intended to showcase features of the EPUB standard, and to provide testing materials for Reading System developers. It is maintained by the W3C's [EPUB 3 Community Group](https://www.w3.org/community/epub3/).

For quick access to the samples, please see the [samples table](http://idpf.github.io/epub3-samples/30/samples.html) and [feature matrix](http://idpf.github.io/epub3-samples/30/feature-matrix.html).

Please see the [project page](http://idpf.github.io/epub3-samples/) for more general information about the samples.

## Licensing

Unless specified otherwise in the [sample table](http://idpf.github.io/epub3-samples/30/samples.html), all samples are licensed under [CC-BY-SA 3.0](http://creativecommons.org/licenses/by-sa/3.0/)

## Compiling

All of the latest samples are available for download from the [sample table](http://idpf.github.io/epub3-samples/30/samples.html).

If needed, you can also create EPUB publications directly from the samples source. There are two sets of shell and batch scripts available at the root of the repository.

The first, pack-all, will build all of the samples:

```
pack-all.sh
```

The second script, pack-single, is used to build individual samples:

```
pack-single.sh 30/accessible_epub_3
```

The argument to this script is the relative path to the sample you want to build.

Note: The batch script can be run on Windows OSes; there is no difference in functionality or how it is called.

## Want to contribute?

If you want to contribute to this project, there are several options:

### Reporting Issues

We want to make sure all samples provided here are conformant, pristine, and employ best practices consistently. If you spot an issue while reviewing and/or testing the content, report it to the issue tracker.

### Contributing new samples

If you want to contribute sample(s), please contact the project owners. After an initial discussion, they will either give you write access to the repository, or arrange some other means of getting the content into the repository. Note that all submitted content is by default subject to CC-BY-SA 3.0 licensing.

This site does not list attribution for samples. As a contributor, you may specify attribution metadata only within the submitted EPUB Publication.

Note also that the project owners may suggest or even require modifications to your submissions to be done in order to meet the desired quality level.

### Contributing variations / improvements to existing samples

If you want to contribute to an existing sample by adding to or varying some aspect of it, use the issue tracker and submit your patch as an attachment. Note that your submission must adhere to the same open source license as the containing sample.
