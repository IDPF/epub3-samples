EPUBCheck
=========

This folder contains the distribution of the EPUBCheck project.

EPUBCheck is the official conformance checker for EPUB publications. EPUBCheck can be run as a standalone command-line tool
or used as a Java library.

EPUBCheck is open source software, maintained by the DAISY Consortium on behalf
of the World Wide Web Consortium (W3C).

EPUBCheck project home: https://github.com/w3c/epubcheck


RUNNING
-------

To run the tool you need a Java runtime (1.7 or above).
Any Operating System should do.

Run it from the command line:

>  java -jar epubcheck.jar file.epub

All detected errors are simply printed to the standard error stream.

Print the commandline help with the --help argument:

>  java -jar epubcheck.jar --help


USING AS A LIBRARY
------------------

You can also use EPUBCheck as a library in your Java application. EPUBCheck
public interfaces can be found in the `com.adobe.epubcheck.api` package.
EPUBCheck class can be used to instantiate a validation engine. Use one of its
constructors and then call validate() method. Report is an interface that you
can implement to get a list of the errors and warnings reported by the
validation engine (instead of the error list being printed out).


LICENSING
---------

EPUBCheck is made available under the terms of the 3-Clause BSD License, a
copy of which is available in the file LICENSE.txt.

The list of licenses of third-party software components is detailed in the
file THIRD-PARTY.txt


AUTHORS / CONTRIBUTORS
----------------------

This distribution of EPUBCheck was made by the DAISY Consortium, for W3C.

Initial EPUBCheck development was largely done at Adobe. A significant part of
EPUBCheck functionality comes from the schema validation tool Jing, used with
schemas from the Nu HTML Checker, IDPF, and DAISY. 

Past and present EPUBCheck developers include: Romain Deltour, Matt Garrish,
Tobias Fischer, Markus Gylling, Steve Antoch, Peter Sorotokin, Thomas Ledoux,
Masayoshi Takahashi, Paul Norton, Piotr Kula, Arwen Pond, Liza Daly, Garth
Conboy, and several others: https://github.com/w3c/epubcheck/graphs/contributors

Many thanks to the numerous people who have contributed to the evolution of
EPUBCheck through bug reports, pull requests, and translations!
